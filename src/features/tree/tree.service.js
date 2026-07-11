import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import { generateUniqueTreeSlug } from "../../utils/tree.js";
import { ensureTreeOwnership } from "../person/person.service.js";
import crypto from 'crypto';

const parseTreeId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid tree id", 400);
  }
  return id;
};

const parseShareExpiry = (expiresAt) => {
  if (!expiresAt || expiresAt === "never") return null;
  const now = new Date();

  switch (expiresAt) {
    case "3m":
      return new Date(now.setMonth(now.getMonth() + 3));
    case "6m":
      return new Date(now.setMonth(now.getMonth() + 6));
    case "12m":
      return new Date(now.setMonth(now.getMonth() + 12));
    default: {
      const parsed = new Date(expiresAt);
      if (Number.isNaN(parsed.getTime())) {
        throw new AppError("Invalid share expiry", 400);
      }
      return parsed;
    }
  }
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

  const sharredLinks = await prisma.treeShareToken.findMany({
    where: {
      treeId: {
        in: allTrees.map(tree => tree.id)
      },
    },
  });

  allTrees.forEach(tree => {
    const shareTokensForTree = sharredLinks.filter(link => link.treeId === tree.id);
    tree.linkHistory = shareTokensForTree.map(link => ({
      id: link.id,
      permission: link.permission,
      personLimit: link.personLimit,
      expiresAt: link.expiresAt,
      isActive: link.isActive,
      token: link.token,
      link: `${process.env.FRONTEND_URL}/shared?token=${link.token}`
    }));
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


// const PERMISSION_RIGHTS = {
//   VIEW_ONLY:   ['read'],
//   MEDIA_ONLY:  ['read', 'media'],
//   ADD_PERSON:  ['read', 'add_person'],
//   CONTRIBUTOR: ['read', 'add_person', 'media'],
//   EDITOR:      ['read', 'add_person', 'media', 'edit_own'],
//   FULL_ACCESS: ['read', 'add_person', 'media', 'edit_own', 'edit_any'],
// }
async function generateShareLink(treeId, { permission, personLimit = 10, expiresAt }, req) {
  const parsedTreeId = parseTreeId(treeId);
  await ensureTreeOwnership(parsedTreeId, req.user.id);
  const shareId = crypto.randomBytes(16).toString("hex");

  const expiresAtDate = parseShareExpiry(expiresAt);
  const newShareTokenEntry = await prisma.treeShareToken.create({
    data: {
      treeId: parsedTreeId,
      createdBy: req.user.id,
      personLimit,
      token: shareId,
      permission,
      expiresAt: expiresAtDate,
    },
  });
  return {
    ...newShareTokenEntry,
    link: `${process.env.FRONTEND_URL}/shared?token=${shareId}`
  };
}

async function getAllSharedTrees(treeId, req) {
  const parsedTreeId = parseTreeId(treeId);
  await ensureTreeOwnership(parsedTreeId, req.user.id);
  const sharedTrees = await prisma.treeShareToken.findMany({
    where: {
      treeId: parsedTreeId,
    },
    select: {
      id: true,
      token: true,
      permission: true,
      personLimit: true,
      expiresAt: true,
      isActive: true,
      createdBy: true,
    },
  });
  return sharedTrees;
}

async function deleteShareLink(treeId, token, req) {
  const parsedTreeId = parseTreeId(treeId);
  await ensureTreeOwnership(parsedTreeId, req.user.id);
  const deleted = await prisma.treeShareToken.deleteMany({
    where: {
      treeId: parsedTreeId,
      token,
    },
  });
  if (deleted.count === 0) {
    throw new AppError("Share link not found", 404);
  }
  return { message: "Share link deleted successfully" };
}

async function updateSharelink(treeId, token, input, req) {
  const parsedTreeId = parseTreeId(treeId);
  await ensureTreeOwnership(parsedTreeId, req.user.id);
  const existing = await prisma.treeShareToken.findFirst({
    where: { treeId: parsedTreeId, token },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Share link not found", 404);
  }

  const data = {};
  if (Object.prototype.hasOwnProperty.call(input, "permission")) {
    data.permission = input.permission;
  }
  if (Object.prototype.hasOwnProperty.call(input, "personLimit")) {
    data.personLimit = input.personLimit;
  }
  if (Object.prototype.hasOwnProperty.call(input, "expiresAt")) {
    data.expiresAt = parseShareExpiry(input.expiresAt);
  }
  if (Object.prototype.hasOwnProperty.call(input, "isActive")) {
    data.isActive = input.isActive;
  }

  return prisma.treeShareToken.update({
    where: { id: existing.id },
    data,
  })
}

async function getCollaborations(req) {
  console.log("getCollaborations - req.user.id:", req.user.id);
  const collaborations = await prisma.treeShareMember.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      token: {
        select: {
          id: true,
          token: true,
          permission: true,
          personLimit: true,
          expiresAt: true,
          tree: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        }
      }
    }
  });
  return collaborations.map(collab => ({
    id: collab.id,
    token: collab.token.token,
    permission: collab.token.permission,
    personLimit: collab.token.personLimit,
    expiresAt: collab.token.expiresAt,
    tree: collab.token.tree,
    link: `${process.env.FRONTEND_URL}/shared?token=${collab.token.token}`

  }))
}
export default {
  createTree,
  generateShareLink,
  getAllSharedTrees,
  deleteShareLink,
  getAllTrees,
  deleteTree,
  getTreeBySlug,
  getTreeById,
  updateTree,
  updateSharelink,
  getCollaborations
};
