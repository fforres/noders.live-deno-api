import { RouteHandler } from "./../server.ts";
import {
  incrementVote,
  getAllVotes,
  VOTES_KEYS,
  VOTES,
  getVotesById,
  clearVotes,
} from "./model.ts";
import { publishNewVote } from "./sockets.ts";

export const handleVote: RouteHandler = async (req, params) => {
  const voteId = params["vote_id"] as VOTES_KEYS;
  let number = "0";
  if (VOTES[voteId]) {
    number = await incrementVote(voteId);
    await publishNewVote(voteId, number);
  }
  req.respond({
    body: JSON.stringify({
      voteId,
      message: number,
    }),
  });
};

export const handleClear: RouteHandler = async () => {
  return clearVotes();
};

export const handleGetVotes: RouteHandler = async (req, params) => {
  const votesArray = await getAllVotes();
  const votes: { [key: string]: number } = {};
  for (let index = 0; index < votesArray.length; index += 2) {
    const key = votesArray[index];
    const value = Number(votesArray[index + 1]);
    votes[key] = value;
  }
  req.respond({
    body: JSON.stringify({
      votes,
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
