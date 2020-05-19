import { Redis } from "./../database.ts";

export const VOTES = {
  ANGULAR: "ANGULAR",
  EMBER: "EMBER",
  VUE: "VUE",
  REACT: "REACT",
  SVELTE: "SVELTE",
} as const;

export type VOTES_KEYS = keyof typeof VOTES;

export const incrementVote = async (vote: VOTES_KEYS) => {
  return Redis.zincrby("VOTES", 1, vote);
};

export const getAllVotes = async () => {
  return Redis.zrange("VOTES", 0, -1, { withScore: true });
};

export const getVotesById = async (vote: VOTES_KEYS) => {
  return Redis.zscore("VOTES", vote);
};
