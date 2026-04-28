import crypto from "crypto";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

const getCloudinaryUploadSignature = async (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `bills/${req.user.id}`;

  // These params MUST match exactly what client sends to Cloudinary
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

  const signature = crypto
    .createHash("sha256")
    .update(paramsToSign + CLOUDINARY_SECRET)
    .digest("hex");

  return {
    signature,
    timestamp,
    folder,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
  };
};

const saveBillFile = async (
  { bytes, height, width, publicId, cloudinaryUrl },
  req,
  res,
) => {
  let billId = null;
  try {
    //save to db
    const bill = await prisma.$transaction(async (tx) => {
      // Create the file record first (Bills.fileId FK points to it)
      const file = await tx.billFiles.create({
        data: {
          fileUrl: cloudinaryUrl,
          cloudinaryId: publicId,
          fileType: "image",
          fileSize: bytes,
        },
        select: { id: true },
      });

      // Create the bill record linked to the file
      return tx.bills.create({
        data: {
          userId: req.user.id,
          source: "IMAGE",
          status: "QUEUED",
          fileId: file.id,
        },
        select: { id: true },
      });
    });
    billId = bill.id;
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError("Duplicate file upload detected.", 404);
    }
    throw error;
  }

  return billId;
};

export default { getCloudinaryUploadSignature, saveBillFile };
