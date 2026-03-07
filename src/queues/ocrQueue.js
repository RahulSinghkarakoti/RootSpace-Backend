import { Queue } from "bullmq";
import { redisConnection } from "../lib/redis.js";

export const billQueue = new Queue("ocr-processing", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 }, // 5s, 10s, 20s
    removeOnComplete: { count: 100 }, // keep last 100 completed jobs for debugging
    removeOnFail: { count: 500 }, // keep failed jobs longer for inspection
  },
});
