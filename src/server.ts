import { green, white, red } from "https://deno.land/std/fmt/colors.ts";
import * as server from "https://deno.land/std/http/server.ts";
import { PORT, DEFAULT_URL } from "./config.ts";

const isDynamicSegment = (path: string) => path.startsWith(":");

const defaultConfig = {
  port: Number(PORT),
};

type RouteParamsType = { [key: string]: string };

type RouteHandlerMap = {
  method: HTTP_METHODS_KEYS;
  handler: RouteHandler;
  originalRoute: string;
  normalizedRoute: string;
  originalSegments: string[];
  normalizedSegments: string[];
};

export type RouteHandler = (
  request: server.ServerRequest,
  params: RouteParamsType
) => void;

const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
} as const;

type HTTP_METHODS_KEYS = keyof typeof HTTP_METHODS;

export class App {
  Server: server.Server | null = null;
  routes = new Map<string, boolean>();
  routeHandlers = {
    [HTTP_METHODS.GET]: new Map<string, RouteHandlerMap>(),
    [HTTP_METHODS.POST]: new Map<string, RouteHandlerMap>(),
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
    const normalizedPath = this.normalizePath(path);
    this.routeHandlers[method].set(normalizedPath, {
      handler,
      method,
      originalRoute: path,
      originalSegments: path.split("/").filter(Boolean),
      normalizedRoute: normalizedPath,
      normalizedSegments: normalizedPath.split("/").filter(Boolean),
    });
  };

  private getRequestsParams = (
    routeHandlerMap: RouteHandlerMap,
    pathname: string
  ) => {
    const { originalSegments } = routeHandlerMap;
    const segments = pathname.split("/").filter(Boolean);
    const params: RouteParamsType = {};
    originalSegments.forEach((originalSegment, index) => {
      if (isDynamicSegment(originalSegment)) {
        params[originalSegment.substr(1)] = segments[index];
      }
    });
    return params;
  };

  private normalizePath = (path: string) => {
    return path
      .split("/")
      .map((segment) => {
        if (isDynamicSegment(segment)) {
          return "*";
        }
        return segment;
      })
      .join("/");
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

  private routeHandlerLookup = (method: string, path: string) => {
    const routes = [
      ...this.routeHandlers[method as HTTP_METHODS_KEYS].values(),
    ];
    const segments = path.split("/").filter(Boolean);
    const foundRoute = routes.find((routeHandler) => {
      const matchesRequest = (routeSegment: string, index: number) => {
        return (
          routeSegment === segments[index] || isDynamicSegment(routeSegment)
        );
      };
      return (
        routeHandler.originalSegments.length === segments.length &&
        routeHandler.originalSegments.every(matchesRequest)
      );
    });

    return foundRoute;
  };

  listen = async () => {
    if (!this.Server) {
      throw new Error("Server should be instantiated before listening");
    }

    console.log(green(`🔥🔥🔥 Server running on port :${PORT} 🔥🔥🔥 \n`));
    for await (const request of this.Server) {
      const { method } = request;
      const pathname = new URL(request.url, DEFAULT_URL).pathname;
      console.log(white(`${request.method}, ${pathname}`));
      try {
        const routeHandlerMap = this.routeHandlerLookup(method, pathname);
        if (routeHandlerMap) {
          const params = this.getRequestsParams(routeHandlerMap, pathname);
          routeHandlerMap?.handler(request, params);
        } else {
          throw new Error("route not found");
        }
      } catch (e) {
        console.log(red(`${request.method}, ${pathname} NOT FOUND`));
        request.respond({ status: 404 });
      }
    }
  };
}
