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
import { publishNewVote } from "./Votes/sockets.ts";
import { incrementVote, VOTES, VOTES_KEYS } from "./Votes/model.ts";

let twitchChat: WebSocket | undefined;

export const connectTwitch = async () => {
  try {
    twitchChat = await connectWebSocket(TWITCH_SOCKET_URL);
    twitchChat.send(TWITCH_SOCKET_PASS);
    twitchChat.send(TWITCH_SOCKET_NICK);
    twitchChat.send(TWITCH_SOCKET_LOGIN);
    console.log(green("💬💬💬 Twitch chat connected! 💬💬💬 \n"));
    const messages = async (socket: WebSocket): Promise<void> => {
      for await (const msg of socket) {
        if (typeof msg === "string") {
          if (msg === "PING :tmi.twitch.tv") {
            await socket.send("PING :tmi.twitch.tv");
          } else {
            const message = parseTwitchMessage(msg);
            console.log(magenta("<"), yellow(`${message}`));
            if (message?.startsWith(chatCommands.VOTE)) {
              const voteId = message
                .split(chatCommands.VOTE)?.[1]
                .trim() as VOTES_KEYS;
              if (VOTES[voteId]) {
                const number = await incrementVote(voteId);
                await publishNewVote(voteId, number);
              }
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
