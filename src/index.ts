import {
  handleVote,
  handleGetVotes,
  handleGetVotesById,
} from "./Votes/router.ts";
import { App } from "./server.ts";
import { handleWebsocket } from "./sockets.ts";
import { connectTwitch } from "./twitchClient.ts";
import "./database.ts";

const app = new App();
connectTwitch();
app.post("/api/votes/:vote_id/vote", handleVote);
app.get("/api/votes", handleGetVotes);
app.get("/api/votes/:vote_id", handleGetVotesById);
app.get("/api", (req, params) => {
  console.log(params);
});
app.ws("/ws", handleWebsocket);

app.listen();
