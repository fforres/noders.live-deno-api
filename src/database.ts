import { green } from "https://deno.land/std/fmt/colors.ts";
import { REDIS_HOSTNAME, REDIS_PORT, REDIS_PASSWORD } from "./config.ts";
import { connect } from "https://denopkg.com/keroxp/deno-redis/mod.ts";
const redis = await connect({
  hostname: REDIS_HOSTNAME,
  port: REDIS_PORT,
});
await redis.auth(REDIS_PASSWORD);
console.log(green(`💾💾💾 Databse Connected 💾💾💾 \n`));

export const Redis = redis;
