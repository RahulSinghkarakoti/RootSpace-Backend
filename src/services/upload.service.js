import crypto from "crypto";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

const getCloudinaryUploadSignature = async (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  // Allow client to request signatures scoped to a specific person and type (avatar/media)
  const personId = req.query.personId;
  const type = req.query.type || 'avatar'; // 'avatar' or 'media'

  let folderBase = type === 'media' ? 'media' : 'avatars';
  let folder = `${folderBase}/${req.user.id}`;

  // If a personId is provided, validate ownership and include it in the folder path
  if (personId) {
    const person = await prisma.person.findFirst({
      where: {
        id: personId,
        tree: { createdBy: req.user.id },
      },
      select: { id: true },
    });

    if (!person) {
      throw new AppError('Person not found or access denied', 404);
    }

    folder = `${folder}/${personId}`;
  }

  // These params MUST match exactly what client sends to Cloudinary
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

  const signature = crypto
    .createHash('sha256')
    .update(paramsToSign + CLOUDINARY_SECRET)
    .digest('hex');

  return {
    signature,
    timestamp,
    folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
  };
};

const extractCloudinaryPublicId = (url) => {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

const destroyCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  const timestamp = Math.round(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_SECRET}`)
    .digest("hex");

  const form = new URLSearchParams({
    public_id: publicId,
    api_key: CLOUDINARY_API_KEY,
    timestamp: String(timestamp),
    signature,
  });

  await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`, {
    method: "POST",
    body: form,
  });
};

const savePersonAvatar = async (
  { personId, publicId, cloudinaryUrl },
  req,
  res,
) => {
  const person = await prisma.person.findFirst({
    where: {
      id: personId,
      tree: { createdBy: req.user.id },
    },
  });

  if (!person) {
    throw new AppError("Person not found or access denied", 404);
  }

  const oldPublicId = person.avatarUrl
    ? extractCloudinaryPublicId(person.avatarUrl)
    : null;

  const updatedPerson = await prisma.person.update({
    where: { id: personId },
    data: {
      avatarUrl: cloudinaryUrl,
    },
    select: {
      id: true,
      avatarUrl: true,
    },
  });

  if (oldPublicId && oldPublicId !== publicId) {
    try {
      await destroyCloudinaryImage(oldPublicId);
    } catch (error) {
      // Log cleanup failures, but do not fail the avatar update
      console.warn("Failed to delete old Cloudinary avatar:", error);
    }
  }

  return {
    personId: updatedPerson.id,
    avatarUrl: updatedPerson.avatarUrl,
    publicId,
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

export default { getCloudinaryUploadSignature, savePersonAvatar, saveBillFile };
