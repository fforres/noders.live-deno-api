import * as server from "https://deno.land/std/http/server.ts";
import {
  green,
  red,
  yellow,
  blue,
  magenta,
} from "https://deno.land/std/fmt/colors.ts";
import {
  connectWebSocket,
  WebSocket,
  acceptWebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std/ws/mod.ts";
import {
  TWITCH_SOCKET_PASS,
  TWITCH_SOCKET_NICK,
  TWITCH_SOCKET_URL,
  TWITCH_SOCKET_LOGIN,
} from "./config.ts";
import { chatCommands, parseTwitchMessage } from "./utils.ts";

type RequestHandler = (req: server.ServerRequest) => Promise<void>;
type ErrorHandler = (error: Error, req?: server.ServerRequest) => void;

export class Sockets {
  port: number;
  twitchChat?: WebSocket;
  socketServer?: server.Server;
  onUnexpectedRouteError: null | ErrorHandler = null;
  allWebsockets: Set<WebSocket> = new Set();

  static defaultConfig = {
    port: 3001,
  };

  constructor(config: { port?: number } = {}) {
    const mergedConfig = { ...Sockets.defaultConfig, ...config };
    this.port = mergedConfig.port;
  }

  startWebsocketServer = async () => {
    this.socketServer = server.serve({ port: this.port });
    console.log(
      green(`🔥🔥🔥 Servidor WS corriendo en el puerto :${this.port} 🔥🔥🔥 \n`)
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
              console.log(yellow(`Socket cerrado! ${ev.code} - ${ev.reason}`));
              this.allWebsockets.delete(sock);
            }
          }
        } catch (err) {
          console.error(red(`Error reciebiendo frame: ${err}`));
          if (!sock.isClosed) {
            await sock.close(1000).catch(console.error);
          }
        }
      } catch (err) {
        console.error(red(`Error aceptando socket:: ${err}`));
        await req.respond({ status: 400 });
      }
    }
  };

  #publishMessage = async (message: {
    command: chatCommands;
    message: string;
  }) => {
    const parsedMessage = JSON.stringify(message);
    if (this.allWebsockets.size > 1) {
      console.log(
        magenta(`Publicando mensaje a `),
        yellow(this.allWebsockets.size.toString()),
        magenta(" socket")
      );
    }
    for await (const socket of this.allWebsockets) {
      try {
        if (socket.isClosed) {
          return;
        }
        console.log(
          blue(`[SOCKET] - Enviando mensaje: "`),
          yellow(message.message),
          blue('"')
        );
        socket?.send(parsedMessage);
      } catch (e) {
        console.error(red(`Error: ${e}`));
      }
    }
  };

  connectTwitch = async () => {
    try {
      console.log(green("💬💬💬 Chat de twitch conectado! 💬💬💬 \n"));
      this.twitchChat = await connectWebSocket(TWITCH_SOCKET_URL);
      this.twitchChat.send(TWITCH_SOCKET_PASS);
      this.twitchChat.send(TWITCH_SOCKET_NICK);
      this.twitchChat.send(TWITCH_SOCKET_LOGIN);

      const messages = async (socket: WebSocket): Promise<void> => {
        for await (const msg of socket) {
          if (typeof msg === "string") {
            if (msg === "PING :tmi.twitch.tv") {
              await socket.send("PING :tmi.twitch.tv");
            } else {
              const message = parseTwitchMessage(msg);
              console.log(magenta("<"), yellow(`${message}`));
              if (message?.startsWith(chatCommands.VOTE)) {
                await this.#publishMessage({
                  command: chatCommands.VOTE,
                  message: message.split(chatCommands.VOTE)?.[1].trim(),
                });
              }
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
    const voteOptions = ["ANGULAR", "EMBER", "VUE", "REACT", "SVELTE"];
    setInterval(() => {
      const item = voteOptions[Math.floor(Math.random() * voteOptions.length)];
      this.#publishMessage({
        command: chatCommands.VOTE,
        message: item,
      });
    }, 450);
  };
}
