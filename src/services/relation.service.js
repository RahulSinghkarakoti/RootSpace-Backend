import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

const parseTreeId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid tree id", 400);
  }
  return id;
};

const parseRelationId = (value) => {
  if (!value || typeof value !== "string") {
    throw new AppError("Invalid relation id", 400);
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

const createRelation = async (treeId, input, req) => {
  const parsedTreeId = parseTreeId(treeId);
  await ensureTreeOwnership(parsedTreeId, req.user.id);
  await ensurePersonInTree(input.fromId, parsedTreeId);
  await ensurePersonInTree(input.toId, parsedTreeId);

  const relation = await prisma.relation.create({
    data: {
      treeId: parsedTreeId,
      fromId: input.fromId,
      toId: input.toId,
      type: input.type,
      metadata: input.metadata ?? null,
      isActive: input.isActive ?? true,
    },
  });

  return relation;
};

const getTreeRelations = async (treeId, req) => {
  const parsedTreeId = parseTreeId(treeId);
  await ensureTreeOwnership(parsedTreeId, req.user.id);

  const relations = await prisma.relation.findMany({
    where: { treeId: parsedTreeId },
    orderBy: { createdAt: "desc" },
  });

  return relations;
};

const getRelationById = async (relationId, req) => {
  const id = parseRelationId(relationId);
  const relation = await prisma.relation.findFirst({
    where: {
      id,
      tree: { createdBy: req.user.id },
    },
  });

  if (!relation) {
    throw new AppError("Relation not found", 404);
  }

  return relation;
};

const updateRelation = async (relationId, input, req) => {
  const id = parseRelationId(relationId);
  const existing = await prisma.relation.findFirst({
    where: {
      id,
      tree: { createdBy: req.user.id },
    },
  });

  if (!existing) {
    throw new AppError("Relation not found", 404);
  }

  if (input.fromId) {
    await ensurePersonInTree(input.fromId, existing.treeId);
  }

  if (input.toId) {
    await ensurePersonInTree(input.toId, existing.treeId);
  }

  const relation = await prisma.relation.update({
    where: { id },
    data: {
      fromId: input.fromId ?? existing.fromId,
      toId: input.toId ?? existing.toId,
      type: input.type ?? existing.type,
      metadata: input.metadata ?? existing.metadata,
      isActive: Object.prototype.hasOwnProperty.call(input, "isActive") ? input.isActive : existing.isActive,
    },
  });

  return relation;
};

const deleteRelation = async (relationId, req) => {
  const id = parseRelationId(relationId);
  const existing = await prisma.relation.findFirst({
    where: {
      id,
      tree: { createdBy: req.user.id },
    },
  });

  if (!existing) {
    throw new AppError("Relation not found", 404);
  }

  const relation = await prisma.relation.delete({
    where: { id },
  });

  return relation;
};

export default {
  createRelation,
  getTreeRelations,
  getRelationById,
  updateRelation,
  deleteRelation,
};
