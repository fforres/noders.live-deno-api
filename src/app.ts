import { chatCommands, parseTwitchMessage } from "./utils.ts";
import * as server from "https://deno.land/std/http/server.ts";
import { green, red, yellow, blue } from "https://deno.land/std/fmt/colors.ts";
import {
  connectWebSocket,
  WebSocket,
  acceptWebSocket,
  isWebSocketPingEvent,
  isWebSocketCloseEvent,
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
  twitchChat?: WebSocket;
  socketServer?: server.Server;
  onUnexpectedRouteError: null | ErrorHandler = null;
  allWebsockets: Set<WebSocket> = new Set();
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
      green(`\n 🔥🔥🔥 Servidor corriendo en el puerto :${this.port} 🔥🔥🔥 \n`)
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

  startWebsocketServer = async () => {
    this.socketServer = server.serve({ port: this.port + 1 });
    console.log(
      green(
        `\n 🔥🔥🔥 Servidor WS corriendo en el puerto :${
          this.port + 1
        } 🔥🔥🔥 \n\n`
      )
    );
    for await (const req of this.socketServer) {
      const { conn, r: bufReader, w: bufWriter, headers } = req;
      try {
        const sock = await acceptWebSocket({
          conn,
          bufReader,
          bufWriter,
          headers,
        });
        // TODO: Figure out what's going on with sockets only accepting 1 connection
        this.allWebsockets.add(sock);
        try {
          for await (const ev of sock) {
            if (isWebSocketCloseEvent(ev)) {
              console.log(yellow(`Socket closed! ${ev.code} - ${ev.reason}`));
            }
          }
        } catch (err) {
          console.error(`failed to receive frame: ${err}`);
          if (!sock.isClosed) {
            await sock.close(1000).catch(console.error);
          }
        }
      } catch (err) {
        console.error(`failed to accept websocket: ${err}`);
        await req.respond({ status: 400 });
      }
    }
  };

  #publishMessage = async (message: {
    command: chatCommands;
    message: string;
  }) => {
    const parsedMessage = JSON.stringify(message);
    console.log(
      blue(`Publishing messages to`),
      yellow(this.allWebsockets.size.toString()),
      blue("sockets")
    );
    for await (const socket of this.allWebsockets) {
      try {
        if (!socket.isClosed) {
          // this.allWebsockets.delete(socket);
          console.log(blue(`[SOCKET] - Sending message: ${message.message}`));
          socket?.send(parsedMessage);
        }
      } catch (e) {
        console.error(red(`Error: ${e}`));
      }
    }
  };

  connectTwitch = async () => {
    try {
      console.log(green("\n💬💬💬 TWITCH CHAT CONNECTED! 💬💬💬\n"));
      this.twitchChat = await connectWebSocket(TWITCH_SOCKET_URL);
      this.twitchChat.send(TWITCH_SOCKET_PASS);
      this.twitchChat.send(TWITCH_SOCKET_NICK);
      this.twitchChat.send(TWITCH_SOCKET_LOGIN);

      const messages = async (socket: WebSocket): Promise<void> => {
        for await (const msg of socket) {
          if (typeof msg === "string") {
            const message = parseTwitchMessage(msg);
            console.log(yellow(`< ${message}`));
            if (message?.startsWith(chatCommands.HOLA)) {
              await this.#publishMessage({
                command: chatCommands.VOTE,
                message: message.split(chatCommands.HOLA)?.[1],
              });
            }
            if (msg === "PING :tmi.twitch.tv") {
              await socket.send("PING :tmi.twitch.tv");
            }
          }
        }
      };
      await messages(this.twitchChat).catch(console.error);
      if (!this.twitchChat.isClosed) {
        await this.twitchChat.close(1000).catch(console.error);
      }
    } catch (e) {
      console.error(red("ERROR ON THE SOCKET!"), red(e));
    }
  };

  startTests = () => {
    // setInterval(() => {
    //   this.#publishMessage({
    //     command: chatCommands.TEST,
    //     message: `Message! - ${Date.now().toString()}`,
    //   });
    // }, 1000);

    setInterval(() => {
      this.#publishMessage({
        command: chatCommands.VOTE,
        message: `ANGULAR`,
      });
    }, 1000);
  };
}
