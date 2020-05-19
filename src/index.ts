import {
  handleVote,
  handleGetVotes,
  handleGetVotesById,
  handleClear,
} from "./Votes/router.ts";
import { App } from "./server.ts";
import { handleWebsocket } from "./sockets.ts";
import { connectTwitch } from "./twitchClient.ts";
import "./database.ts";

const app = new App();
connectTwitch();
app.get("/api", (req, params) => {
  console.log(params);
});
app.get("/api/votes", handleGetVotes);
app.post("/api/votes/clear", handleClear);
app.get("/api/votes/:vote_id", handleGetVotesById);
app.post("/api/votes/:vote_id/vote", handleVote);
app.ws("/ws", handleWebsocket);

app.listen();
