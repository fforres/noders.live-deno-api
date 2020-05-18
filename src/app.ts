import {
  Application,
  Router,
} from "https://deno.land/x/denotrain@v0.4.4/mod.ts";
// import { open, save } from "https://deno.land/x/sqlite/mod.ts";
import { DB_NAME } from "./config.ts";
// Create a new application (port defualts to 3000, hostname to 0.0.0.0)
// Optional: Generate router and hook routes to it
const router = new Router();

export const Api = async (config = { port: 4000 }) => {
  // const db = await open(DB_NAME);
  const app = new Application(config);

  router.get("/clear", (context) => {});

  app.use("/api", router);
  app.get("/api", () => "Noders.live Twitch API");
  return app;
};

// import * as server from "https://deno.land/std/http/server.ts";
// import { green } from "https://deno.land/std/fmt/colors.ts";

// type RequestHandler = (req: server.ServerRequest) => Promise<void>;
// type ErrorHandler = (error: Error, req?: server.ServerRequest) => void;

// export class App {
//   port: number;
//   server?: server.Server;
//   onUnexpectedRouteError: null | ErrorHandler = null;
//   #middlewares = new Set<RequestHandler>();
//   #routeHandlers = {
//     getHandlers: new Map<string, RequestHandler>(),
//     postHandlers: new Map<string, RequestHandler>(),
//   };

//   static defaultConfig = {
//     port: 3000,
//   };

//   constructor(config: { port?: number } = {}) {
//     const mergedConfig = { ...App.defaultConfig, ...config };
//     this.port = mergedConfig.port;
//   }

//   #getRouteHandler = (method: string) => {
//     if (method === "GET") {
//       return this.#routeHandlers.getHandlers;
//     } else if (method === "POST") {
//       return this.#routeHandlers.postHandlers;
//     }
//   };

//   attachMiddleware = (middleware: RequestHandler) => {
//     this.#middlewares.add(middleware);
//   };

//   onGet = (path: string, handler: RequestHandler) => {
//     console.info(`Adjuntando [GET] handler para ${path}`);
//     if (this.#routeHandlers.getHandlers.has(path)) {
//       console.warn(
//         `Ya existe un [GET] handler para ${path}, será sobreescrito`
//       );
//     }
//     this.#routeHandlers.getHandlers.set(path, handler);
//   };

//   onPost = (path: string, handler: RequestHandler) => {
//     console.info(`Adjuntando [POST] handler para ${path}`);
//     if (this.#routeHandlers.postHandlers.has(path)) {
//       console.warn(
//         `Ya existe un [GET] handler para ${path}, será sobreescrito`
//       );
//     }
//     this.#routeHandlers.postHandlers.set(path, handler);
//   };

//   #handleRoutes = async (req: server.ServerRequest) => {
//     const { pathname } = new URL(req.url, `http://localhost:${this.port}`);
//     console.info(`[${req.method}] para pathname =>: ${pathname}`);
//     const possibleFunction = this.#getRouteHandler(req.method)?.get(pathname);
//     if (possibleFunction) {
//       console.info(`[${req.method}] handler encontrado para: ${pathname}`);
//       await possibleFunction(req);
//     } else {
//       console.error(`[${req.method}] handler NO ENCONTRADO para: ${pathname}`);
//     }
//   };

//   #handleMiddlewares = async (req: server.ServerRequest) => {
//     for await (const middleware of this.#middlewares) {
//       await middleware(req);
//     }
//   };

//   startListening = async () => {
//     this.server = server.serve({ port: this.port });
//     console.log(
//       green(`🔥🔥🔥 Servidor corriendo en el puerto :${this.port} 🔥🔥🔥 \n`)
//     );
//     for await (const req of this.server) {
//       try {
//         await this.#handleMiddlewares(req);
//         await this.#handleRoutes(req);
//       } catch (error) {
//         if (typeof this.onUnexpectedRouteError === "function") {
//           this.onUnexpectedRouteError(error as Error, req);
//         } else {
//           throw new Error(error);
//         }
//       } finally {
//         if ((req as any).finalized === false) {
//           req.respond({ body: JSON.stringify({ error: "unexpected" }) });
//         }
//       }
//     }
//   };
// }
