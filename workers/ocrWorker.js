import { Worker } from "bullmq";
import { redisConnection } from "../src/lib/redis.js";
import prisma from "../src/config/prisma.js";

const worker = new Worker(
  "ocr-processing",
  async (job) => {
    const { billId } = job.data;

    console.log("Processing bill", billId);

   const bill = await prisma.bills.findUnique({
      where: { id: BigInt(billId) },
      include: {
        file: true
      }
    });

console.log(bill)

    if (!bill) throw new Error("Bill not found");

    // simulate OCR
    const text = "-------Sample OCR text-------";

    console.log(text);
    // await prisma.billOCR.create({
    //   data: {
    //     billId: bill.id,
    //     rawText: { text }
    //   }
    // });

    // await prisma.bills.update({
    //   where: { id: bill.id },
    //   data: {
    //     status: "OCR_DONE"
    //   }
    // });
  },
  { connection: redisConnection },
);

worker.on("completed", (job) => {
  console.log("Job completed", job.id);
});

worker.on("failed", (job, err) => {
  console.log("Job failed", err);
});
