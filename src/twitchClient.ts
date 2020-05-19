import {
  green,
  red,
  yellow,
  magenta,
} from "https://deno.land/std/fmt/colors.ts";
import { connectWebSocket, WebSocket } from "https://deno.land/std/ws/mod.ts";
import { chatCommands, parseTwitchMessage } from "./utils.ts";
import {
  TWITCH_SOCKET_PASS,
  TWITCH_SOCKET_NICK,
  TWITCH_SOCKET_URL,
  TWITCH_SOCKET_LOGIN,
} from "./config.ts";
import { publishMessage } from "./sockets.ts";

let twitchChat: WebSocket | undefined;

export const connectTwitch = async () => {
  try {
    console.log(green("💬💬💬 Chat de twitch conectado! 💬💬💬 \n"));
    twitchChat = await connectWebSocket(TWITCH_SOCKET_URL);
    twitchChat.send(TWITCH_SOCKET_PASS);
    twitchChat.send(TWITCH_SOCKET_NICK);
    twitchChat.send(TWITCH_SOCKET_LOGIN);

    const messages = async (socket: WebSocket): Promise<void> => {
      for await (const msg of socket) {
        if (typeof msg === "string") {
          if (msg === "PING :tmi.twitch.tv") {
            await socket.send("PING :tmi.twitch.tv");
          } else {
            const message = parseTwitchMessage(msg);
            console.log(magenta("<"), yellow(`${message}`));
            if (message?.startsWith(chatCommands.VOTE)) {
              await publishMessage({
                command: chatCommands.VOTE,
                message: message.split(chatCommands.VOTE)?.[1].trim(),
              });
            }
          }
        }
      }
    };
    await messages(twitchChat).catch(console.error);
    if (!twitchChat.isClosed) {
      await twitchChat.close(1000).catch(console.error);
    }
  } catch (e) {
    console.error(red("ERROR ON THE SOCKET!"), red(e));
  }
};
