import { RouteHandler } from "./../server.ts";
import {
  incrementVote,
  getAllVotes,
  VOTES_KEYS,
  VOTES,
  getVotesById,
} from "./model.ts";
import { publishMessage } from "../sockets.ts";
import { chatCommands } from "../utils.ts";

export const handleVote: RouteHandler = async (req, params) => {
  const voteId = params["vote_id"] as VOTES_KEYS;
  let number = "0";
  if (VOTES[voteId]) {
    number = await incrementVote(voteId);
    console.log({ number });
    publishMessage({
      command: chatCommands.VOTE,
      message: number,
    });
  }
  req.respond({
    body: JSON.stringify({
      voteId,
      message: number,
    }),
  });
};

export const handleGetVotes: RouteHandler = async (req, params) => {
  const votes = await getAllVotes();
  console.log({ votes });
  req.respond({
    body: JSON.stringify({
      message: votes,
    }),
  });
};

export const handleGetVotesById: RouteHandler = async (req, params) => {
  const voteId = params["vote_id"] as VOTES_KEYS;
  let number = "0";
  if (VOTES[voteId]) {
    number = (await getVotesById(voteId)) as string;
  }
  req.respond({
    body: JSON.stringify({
      message: number,
    }),
  });
};
