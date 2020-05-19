import { App } from "./server.ts";
import { handleWebsocket } from "./sockets.ts";
import { connectTwitch } from "./twitchClient.ts";
import "./database.ts";

const app = new App();
connectTwitch();
app.ws("/ws", handleWebsocket);

app.listen();
