import { parseTwitchMessage } from "./utils.ts";
import * as server from "https://deno.land/std/http/server.ts";
import { green, red, yellow } from "https://deno.land/std/fmt/colors.ts";
import {
  connectWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "https://deno.land/std/ws/mod.ts";
import {
  TWITCH_SOCKET_PASS,
  TWITCH_SOCKET_NICK,
  TWITCH_SOCKET_URL,
  TWITCH_SOCKET_LOGIN,
} from "./config.ts";

type RequestHandler = (req: server.ServerRequest) => Promise<void>;
type ErrorHandler = (error: Error, req?: server.ServerRequest) => void;

export class App {
  port: number;
  server?: server.Server;
  socket?: WebSocket;
  onUnexpectedRouteError: null | ErrorHandler = null;
  #middlewares = new Set<RequestHandler>();
  #routeHandlers = {
    getHandlers: new Map<string, RequestHandler>(),
    postHandlers: new Map<string, RequestHandler>(),
  };

  static defaultConfig = {
    port: 3000,
  };

  constructor(config: { port?: number } = {}) {
    const mergedConfig = { ...App.defaultConfig, ...config };
    this.port = mergedConfig.port;
  }

  #getRouteHandler = (method: string) => {
    if (method === "GET") {
      return this.#routeHandlers.getHandlers;
    } else if (method === "POST") {
      return this.#routeHandlers.postHandlers;
    }
  };

  attachMiddleware = (middleware: RequestHandler) => {
    this.#middlewares.add(middleware);
  };

  onGet = (path: string, handler: RequestHandler) => {
    console.info(`Adjuntando [GET] handler para ${path}`);
    if (this.#routeHandlers.getHandlers.has(path)) {
      console.warn(
        `Ya existe un [GET] handler para ${path}, será sobreescrito`
      );
    }
    this.#routeHandlers.getHandlers.set(path, handler);
  };

  onPost = (path: string, handler: RequestHandler) => {
    console.info(`Adjuntando [POST] handler para ${path}`);
    if (this.#routeHandlers.postHandlers.has(path)) {
      console.warn(
        `Ya existe un [GET] handler para ${path}, será sobreescrito`
      );
    }
    this.#routeHandlers.postHandlers.set(path, handler);
  };

  #handleRoutes = async (req: server.ServerRequest) => {
    const { pathname } = new URL(req.url, `http://localhost:${this.port}`);
    console.info(`[${req.method}] para pathname =>: ${pathname}`);
    const possibleFunction = this.#getRouteHandler(req.method)?.get(pathname);
    if (possibleFunction) {
      console.info(`[${req.method}] handler encontrado para: ${pathname}`);
      await possibleFunction(req);
    } else {
      console.error(`[${req.method}] handler NO ENCONTRADO para: ${pathname}`);
    }
  };

  #handleMiddlewares = async (req: server.ServerRequest) => {
    for await (const middleware of this.#middlewares) {
      await middleware(req);
    }
  };

  startListening = async () => {
    this.server = server.serve({ port: this.port });
    console.log(
      green(
        `\n 🔥🔥🔥 Servidor corriendo en el puerto :${this.port} 🔥🔥🔥 \n\n`
      )
    );
    for await (const req of this.server) {
      try {
        await this.#handleMiddlewares(req);
        await this.#handleRoutes(req);
      } catch (error) {
        if (typeof this.onUnexpectedRouteError === "function") {
          this.onUnexpectedRouteError(error as Error, req);
        } else {
          throw new Error(error);
        }
      } finally {
        if ((req as any).finalized === false) {
          req.respond({ body: JSON.stringify({ error: "unexpected" }) });
        }
      }
    }
  };

  connectWebSocket = async () => {
    try {
      console.log(green("Connectando sockets!"));
      this.socket = await connectWebSocket(TWITCH_SOCKET_URL);
      const socket = this.socket;
      socket.send(TWITCH_SOCKET_PASS);
      socket.send(TWITCH_SOCKET_NICK);
      socket.send(TWITCH_SOCKET_LOGIN);
      const messages = async (): Promise<void> => {
        for await (const msg of socket) {
          if (typeof msg === "string") {
            const parsedMessage = parseTwitchMessage(msg);
            console.log(yellow(`< [PARSED] ${parsedMessage}`));
            if (msg === "PING :tmi.twitch.tv") {
              await socket.send("PING :tmi.twitch.tv");
            }
          } else if (isWebSocketCloseEvent(msg)) {
            console.log(red(`closed: code=${msg.code}, reason=${msg.reason}`));
          }
        }
      };

      await Promise.race([messages()]).catch(console.error);

      if (!socket.isClosed) {
        await socket.close(1000).catch(console.error);
      }
    } catch (e) {
      console.error(red("ERROR ON THE SOCKET!"), red(e));
    }
  };
}
