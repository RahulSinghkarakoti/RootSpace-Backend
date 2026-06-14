import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";

const parseTreeId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid tree id", 400);
  }
  return id;
};

const parseMediaId = (value) => {
  if (!value || typeof value !== "string") {
    throw new AppError("Invalid media id", 400);
  }
  return value;
};

const ensureTreeOwnership = async (treeId, userId) => {
  const tree = await prisma.trees.findUnique({
    where: { id: treeId },
    select: { id: true, createdBy: true },
  });

  if (!tree || tree.createdBy !== userId) {
    throw new AppError("Tree not found or access denied", 404);
  }
};

const ensurePersonInTree = async (personId, treeId) => {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { treeId: true },
  });

  if (!person || person.treeId !== treeId) {
    throw new AppError("Person does not belong to the specified tree", 400);
  }
};

const buildMediaPayload = (input) => ({
  url: input.url,
  type: input.type,
  personId: Object.prototype.hasOwnProperty.call(input, "personId") ? input.personId : undefined,
  altText: Object.prototype.hasOwnProperty.call(input, "altText") ? input.altText : undefined,
  caption: Object.prototype.hasOwnProperty.call(input, "caption") ? input.caption : undefined,
  isFeatured: Object.prototype.hasOwnProperty.call(input, "isFeatured") ? input.isFeatured : undefined,
  order: Object.prototype.hasOwnProperty.call(input, "order") ? input.order : undefined,
});

const createMedia = async (treeId, input, req) => {
  const parsedTreeId = parseTreeId(treeId);
  await ensureTreeOwnership(parsedTreeId, req.user.id);

  if (input.personId) {
    await ensurePersonInTree(input.personId, parsedTreeId);
  }

  const media = await prisma.media.create({
    data: {
      treeId: parsedTreeId,
      ...buildMediaPayload(input),
    },
  });

  return media;
};

const getTreeMedia = async (treeId, req) => {
  const parsedTreeId = parseTreeId(treeId);
  await ensureTreeOwnership(parsedTreeId, req.user.id);

  const media = await prisma.media.findMany({
    where: { treeId: parsedTreeId },
    orderBy: { order: "asc" },
  });

  return media;
};

const getMediaById = async (mediaId, req) => {
  const id = parseMediaId(mediaId);
  const media = await prisma.media.findFirst({
    where: {
      id,
      OR: [
        { tree: { createdBy: req.user.id } },
        { person: { tree: { createdBy: req.user.id } } },
      ],
    },
  });

  if (!media) {
    throw new AppError("Media not found", 404);
  }

  return media;
};

const updateMedia = async (mediaId, input, req) => {
  const id = parseMediaId(mediaId);
  const existing = await prisma.media.findFirst({
    where: {
      id,
      OR: [
        { tree: { createdBy: req.user.id } },
        { person: { tree: { createdBy: req.user.id } } },
      ],
    },
  });

  if (!existing) {
    throw new AppError("Media not found", 404);
  }

  if (Object.prototype.hasOwnProperty.call(input, "personId") && input.personId) {
    await ensurePersonInTree(input.personId, existing.treeId);
  }

  const payload = buildMediaPayload(input);
  const media = await prisma.media.update({
    where: { id },
    data: {
      ...payload,
    },
  });

  return media;
};

const deleteMedia = async (mediaId, req) => {
  const id = parseMediaId(mediaId);
  const existing = await prisma.media.findFirst({
    where: {
      id,
      OR: [
        { tree: { createdBy: req.user.id } },
        { person: { tree: { createdBy: req.user.id } } },
      ],
    },
  });

  if (!existing) {
    throw new AppError("Media not found", 404);
  }

  const media = await prisma.media.delete({
    where: { id },
  });

  return media;
};

export default {
  createMedia,
  getTreeMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
};
