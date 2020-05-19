import { VOTES_KEYS } from "./model.ts";
import { publishMessage } from "./../sockets.ts";
import { chatCommands } from "../utils.ts";

export const publishNewVote = (voteKey: VOTES_KEYS, voteValue: string) => {
  return publishMessage({
    command: chatCommands.VOTE,
    message: {
      voteKey,
      voteValue: Number(voteValue),
    },
  });
};
