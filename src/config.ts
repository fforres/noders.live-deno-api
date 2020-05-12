// Estas variables estan acá Mientras se mergea https://github.com/pietvanzoen/deno-dotenv/pull/17
// Luego de eso, nos movemos a dotenv
const TWITCH_CODE = "";
const TWITCH_APPLICATION_CLIENT_ID = "";
const TWITCH_NICK = "backargorg";

export const TWITCH_SOCKET_URL = "ws://irc-ws.chat.twitch.tv:80";
export const TWITCH_SOCKET_PASS = `PASS oauth:${TWITCH_CODE}`;
export const TWITCH_SOCKET_NICK = `NICK ${TWITCH_NICK}`;

export const TWITCH_LOGIN_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_APPLICATION_CLIENT_ID}&redirect_uri=http://localhost:3000/api/twitch/callback&response_type=code&scope=analytics:read:extensions analytics:read:games bits:read channel:edit:commercial channel:read:subscriptions clips:edit user:edit user:edit:broadcast user:edit:follows user:read:broadcast user:read:email chat:read
`;
