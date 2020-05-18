import { parseSearch } from "./utils.ts";
import { TWITCH_LOGIN_URL, PORT } from "./config.ts";
import { Api } from "./app.ts";
import { Sockets } from "./sockets.ts";

const app = await Api({ port: Number(PORT) });
const socketsApp = new Sockets({ port: Number(PORT) + 1 });

app.run();
socketsApp.connectTwitch();
socketsApp.startWebsocketServer();
// socketsApp.startTests();

// app.onGet("/favicon.ico", (request) =>
//   request.respond({
//     body: JSON.stringify({
//       dummy: "favicon",
//     }),
//   })
// );

// app.onGet("/login", (request) =>
//   request.respond({
//     status: 307,
//     headers: new Headers({
//       location: TWITCH_LOGIN_URL,
//     }),
//   })
// );

// app.onGet("/api/twitch/callback", (request) => {
//   const url = new URL(request.url, `localhost:3000`);
//   const queryParms = parseSearch(url.search);
//   const code = queryParms["code"];
//   if (code) {
//     return request.respond({ body: `Tu codigo ${code}` });
//   }
//   return request.respond({ body: "" });
// });

// app.onGet("/api/twitch/test", (request) =>
//   request.respond({
//     body: JSON.stringify({
//       hello: "Hello World",
//     }),
//   })
// );

// app.onPost("/api/twitch/test", (request) =>
//   request.respond({
//     body: JSON.stringify({
//       hello: "Hello World",
//     }),
//   })
// );
