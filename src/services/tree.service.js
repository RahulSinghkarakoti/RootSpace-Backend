import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { generateUniqueTreeSlug } from "../utils/tree.js";

const parseTreeId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid tree id", 400);
  }
  return id;
};

const createTree = async ({ treeName, type, coverImage, isPublic }, req) => {
  const slug = await generateUniqueTreeSlug(treeName);
  const tree = await prisma.trees.create({
    data: {
      name: treeName,
      slug,
      createdBy: req.user.id,
      type: type || "FAMILY",
      coverImage: coverImage || null,
      isPublic: Object.prototype.hasOwnProperty.call({ isPublic }, "isPublic") ? isPublic : false,
    },
  });
  return tree;
};

const getAllTrees = async (req) => {
  const user_id = req.user.id;
  const allTrees = await prisma.trees.findMany({
    where: {
      createdBy: user_id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      createdBy: true,
      _count: {
        select: {
          persons: true,
        },
      },
    },
  });
  return allTrees;
};

const getTreeById = async (treeId, req) => {
  const user_id = req.user.id;
  const parsedTreeId = parseTreeId(treeId);

  const tree = await prisma.trees.findFirst({
    where: {
      id: parsedTreeId,
      createdBy: user_id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      createdBy: true,
      _count: {
        select: {
          persons: true,
        },
      },
    },
  });
  return tree;
};

const getTreeBySlug = async (treeSlug, req) => {
  const user_id = req.user.id;

  const tree = await prisma.trees.findFirst({
    where: {
      slug: treeSlug,
      createdBy: user_id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      createdBy: true,
      _count: {
        select: {
          persons: true,
        },
      },
    },
  });
  return tree;
};

const deleteTree = async (treeId, req) => {
  const user_id = req.user.id;
  const parsedTreeId = parseTreeId(treeId);

  const existing = await prisma.trees.findFirst({
    where: {
      id: parsedTreeId,
      createdBy: user_id,
    },
  });

  if (!existing) {
    throw new AppError("Tree not found", 404);
  }

  const result = await prisma.trees.delete({
    where: {
      id: parsedTreeId,
    },
  });
  return result;
};

const updateTree = async (treeId, input, req) => {
  const parsedTreeId = parseTreeId(treeId);
  const user_id = req.user.id;

  const existing = await prisma.trees.findFirst({
    where: {
      id: parsedTreeId,
      createdBy: user_id,
    },
  });

  if (!existing) {
    throw new AppError("Tree not found", 404);
  }

  const data = {};
  if (Object.prototype.hasOwnProperty.call(input, "treeName")) {
    data.name = input.treeName;
    data.slug = await generateUniqueTreeSlug(input.treeName);
  }
  if (Object.prototype.hasOwnProperty.call(input, "type")) {
    data.type = input.type;
  }
  if (Object.prototype.hasOwnProperty.call(input, "coverImage")) {
    data.coverImage = input.coverImage || null;
  }
  if (Object.prototype.hasOwnProperty.call(input, "isPublic")) {
    data.isPublic = input.isPublic;
  }

  const tree = await prisma.trees.update({
    where: { id: parsedTreeId },
    data,
  });
  return tree;
};

export default {
  createTree,
  getAllTrees,
  deleteTree,
  getTreeBySlug,
  getTreeById,
  updateTree,
};
