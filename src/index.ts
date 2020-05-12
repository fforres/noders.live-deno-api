import { App } from "./app.ts";

const app = new App();

app.attachMiddleware(async (req) => {});

app.onGet("/favicon.ico", (request) =>
  request.respond({
    body: JSON.stringify({
      dummy: "favicon",
    }),
  })
);

app.onGet("/api/twitch/callback", (request) =>
  request.respond({
    body: JSON.stringify({
      hello: "Hello World",
    }),
  })
);

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
app.connectWebSocket();
