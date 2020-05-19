import { JSONSerializable } from "./types.ts";
import * as server from "https://deno.land/std/http/server.ts";
import {
  acceptWebSocket,
  WebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std/ws/mod.ts";
import {
  red,
  yellow,
  blue,
  magenta,
} from "https://deno.land/std@0.50.0/fmt/colors.ts";
import { chatCommands } from "./utils.ts";

const allWebsockets: Set<WebSocket> = new Set();

const listenWebsockets = async (websocket: WebSocket) => {
  allWebsockets.add(websocket);
  try {
    for await (const ev of websocket) {
      if (isWebSocketCloseEvent(ev)) {
        console.log(yellow(`Socket cerrado! ${ev.code} - ${ev.reason}`));
        allWebsockets.delete(websocket);
      }
    }
  } catch (err) {
    console.error(red(`Error reciebiendo frame: ${err}`));
    if (!websocket.isClosed) {
      await websocket.close(1000).catch(console.error);
    }
  }
};

export const publishMessage = async (message: {
  command: chatCommands;
  message: JSONSerializable;
}) => {
  const parsedMessage = JSON.stringify(message);
  if (allWebsockets.size > 1) {
    console.log(
      magenta(`Publicando mensaje a `),
      yellow(allWebsockets.size.toString()),
      magenta(" socket")
    );
  }
  for await (const socket of allWebsockets) {
    try {
      if (socket.isClosed) {
        return;
      }
      console.log(
        magenta(`[SOCKET] - COMMAND: "`),
        yellow(message.command),
        magenta(`" - MESSAGE:"`),
        yellow(JSON.stringify(message.message)),
        magenta('"')
      );
      socket?.send(parsedMessage);
    } catch (e) {
      console.error(red(`Error: ${e}`));
    }
  }
};

export const handleWebsocket = async (req: server.ServerRequest) => {
  const { conn, r: bufReader, w: bufWriter, headers } = req;
  try {
    const sock = await acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    });
    listenWebsockets(sock);
  } catch (err) {
    console.error(red(`Error aceptando socket:: ${err}`));
    await req.respond({ status: 400 });
  }
};

const startTests = () => {
  const voteOptions = ["ANGULAR", "EMBER", "VUE", "REACT", "SVELTE"];
  setInterval(() => {
    const item = voteOptions[Math.floor(Math.random() * voteOptions.length)];
    publishMessage({
      command: chatCommands.VOTE,
      message: item,
    });
  }, 150);
};

// startTests();
