import { config } from "https://deno.land/x/dotenv/mod.ts";

const getEnvVars = (): any => {
  try {
    return config();
  } catch (e) {
    return Deno.env.toObject();
  }
};

const {
  TWITCH_CODE,
  TWITCH_APPLICATION_CLIENT_ID,
  DATABASE_NAME,
  PORT: ENV_PORT,
  DEFAULT_URL: ENV_DEFAULT_URL,
  REDIS_HOSTNAME: ENV_REDIS_HOSTNAME,
  REDIS_PASSWORD: ENV_REDIS_PASSWORD,
  REDIS_PORT: ENV_REDIS_PORT,
} = getEnvVars();
const TWITCH_NICK = "backargorg";

export const TWITCH_SOCKET_URL = "ws://irc-ws.chat.twitch.tv:80";
export const TWITCH_SOCKET_PASS = `PASS oauth:${TWITCH_CODE}`;
export const TWITCH_SOCKET_NICK = `NICK ${TWITCH_NICK}`;
export const TWITCH_SOCKET_LOGIN = `JOIN #${TWITCH_NICK}`;
export const DB_NAME = DATABASE_NAME;
export const PORT = ENV_PORT;
export const DEFAULT_URL = ENV_DEFAULT_URL || "about:blank";
export const REDIS_HOSTNAME = ENV_REDIS_HOSTNAME;
export const REDIS_PASSWORD = ENV_REDIS_PASSWORD;
export const REDIS_PORT = ENV_REDIS_PORT;

export const TWITCH_LOGIN_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_APPLICATION_CLIENT_ID}&redirect_uri=http://localhost:3000/api/twitch/callback&response_type=code&scope=analytics:read:extensions analytics:read:games bits:read channel:edit:commercial channel:read:subscriptions clips:edit user:edit user:edit:broadcast user:edit:follows user:read:broadcast user:read:email chat:read
`;
