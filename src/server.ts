import { green } from "https://deno.land/std/fmt/colors.ts";
import * as server from "https://deno.land/std/http/server.ts";
import { PORT, DEFAULT_URL } from "./config.ts";

const defaultConfig = {
  port: Number(PORT),
};

type RouteHandler = (request: server.ServerRequest) => void;

const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
} as const;

type HTTP_METHODS_KEYS = keyof typeof HTTP_METHODS;

export class App {
  Server: server.Server | null = null;
  routeHandlers = {
    [HTTP_METHODS.GET]: new Map<string, RouteHandler>(),
    [HTTP_METHODS.POST]: new Map<string, RouteHandler>(),
  };

  constructor(config: { port?: number } = {}) {
    const parsedConfig = { ...defaultConfig, ...config };
    this.Server = server.serve({ port: parsedConfig.port });
  }

  private addRouteHandler = (
    path: string,
    method: keyof typeof HTTP_METHODS,
    handler: RouteHandler
  ) => {
    this.routeHandlers[method].set(path, handler);
  };

  get = (path: string, handler: RouteHandler) => {
    this.addRouteHandler(path, HTTP_METHODS.GET, handler);
  };

  post = (path: string, handler: RouteHandler) => {
    this.addRouteHandler(path, HTTP_METHODS.POST, handler);
  };

  ws = (path: string, handler: RouteHandler) => {
    this.addRouteHandler(path, HTTP_METHODS.GET, handler);
  };

  listen = async () => {
    if (!this.Server) {
      throw new Error("Server should be instantiated before listening");
    }

    console.log(
      green(`🔥🔥🔥 Servidor corriendo en el puerto :${PORT} 🔥🔥🔥 \n`)
    );

    for await (const request of this.Server) {
      const url = new URL(request.url, DEFAULT_URL);
      const possibleRouteHandler = this.routeHandlers?.[
        request.method as HTTP_METHODS_KEYS
      ];
      try {
        if (possibleRouteHandler?.has(url.pathname)) {
          possibleRouteHandler.get(url.pathname)?.(request);
        } else {
          throw new Error("route not found");
        }
      } catch (e) {
        request.respond({ status: 404 });
      }
    }
  };
}
