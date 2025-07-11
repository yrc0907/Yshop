import Redis from "ioredis";

// Use a single connection string from the environment variables,
// as recommended by ioredis and provided by cloud services like Upstash.
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  // For local development, you can set REDIS_URL="redis://127.0.0.1:6379"
  throw new Error("REDIS_URL environment variable is not set.");
}

export const redis = new Redis(redisUrl);

export default redis;
