import { parseSearch } from "./utils.ts";
import { TWITCH_LOGIN_URL } from "./config.ts";
import { App } from "./app.ts";
import { Sockets } from "./sockets.ts";

const app = new App({ port: 4000 });
const socketsApp = new Sockets({ port: 4001 });

app.onGet("/favicon.ico", (request) =>
  request.respond({
    body: JSON.stringify({
      dummy: "favicon",
    }),
  })
);

app.onGet("/login", (request) =>
  request.respond({
    status: 307,
    headers: new Headers({
      location: TWITCH_LOGIN_URL,
    }),
  })
);

app.onGet("/api/twitch/callback", (request) => {
  const url = new URL(request.url, `localhost:3000`);
  const queryParms = parseSearch(url.search);
  const code = queryParms["code"];
  if (code) {
    return request.respond({ body: `Tu codigo ${code}` });
  }
  return request.respond({ body: "" });
});

app.onGet("/api/twitch/test", (request) =>
  request.respond({
    body: JSON.stringify({
      hello: "Hello World",
    }),
  })
);

app.onPost("/api/twitch/test", (request) =>
  request.respond({
    body: JSON.stringify({
      hello: "Hello World",
    }),
  })
);

app.startListening();
socketsApp.connectTwitch();
socketsApp.startWebsocketServer();
// socketsApp.startTests();
