import { connect } from "https://denopkg.com/keroxp/deno-redis/mod.ts";
const redis = await connect({
  hostname: "redis-14423.c83.us-east-1-2.ec2.cloud.redislabs.com",
  port: 14423,
});
await redis.auth(`79f3j05Fo1XeEBFYI05LDJW5YCQZ7cs7`);

export const Redis = redis;
