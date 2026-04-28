import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { generateUniquePersonSlug } from "../utils/tree.js";

const ensureTreeOwnership = async (treeId, userId) => {
  const tree = await prisma.trees.findUnique({
    where: { id: treeId },
    select: { id: true, createdBy: true },
  });

  if (!tree || tree.createdBy !== userId) {
    throw new AppError("Tree not found or access denied", 404);
  }

  return tree;
};

const parseTreeId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid tree id", 400);
  }
  return id;
};

const buildCreatePayload = (input) => ({
  fullName: input.fullName,
  gender: input.gender || null,
  birthDate: input.birthDate ? new Date(input.birthDate) : null,
  deathDate: input.deathDate ? new Date(input.deathDate) : null,
  notes: input.notes || null,
});

const buildUpdatePayload = (input) => {
  const payload = {};
  if (Object.prototype.hasOwnProperty.call(input, 'fullName')) payload.fullName = input.fullName;
  if (Object.prototype.hasOwnProperty.call(input, 'gender')) payload.gender = input.gender || null;
  if (Object.prototype.hasOwnProperty.call(input, 'birthDate')) payload.birthDate = input.birthDate ? new Date(input.birthDate) : null;
  if (Object.prototype.hasOwnProperty.call(input, 'deathDate')) payload.deathDate = input.deathDate ? new Date(input.deathDate) : null;
  if (Object.prototype.hasOwnProperty.call(input, 'notes')) payload.notes = input.notes || null;
  return payload;
};

const createPerson = async (treeId, input, req) => {
  const parsedTreeId = parseTreeId(treeId);
  await ensureTreeOwnership(parsedTreeId, req.user.id);

  const slug = await generateUniquePersonSlug(parsedTreeId, input.fullName);

  const person = await prisma.person.create({
    data: {
      treeId: parsedTreeId,
      slug,
      ...buildCreatePayload(input),
    },
  });

  return person;
};

const getAllPeople = async (treeId, req) => {
  const parsedTreeId = parseTreeId(treeId);
  await ensureTreeOwnership(parsedTreeId, req.user.id);

  const people = await prisma.person.findMany({
    where: {
      treeId: parsedTreeId,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      fullName: true,
      gender: true,
      birthDate: true,
      deathDate: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return people;
};

const getPersonInTree = async (treeId, personId, req) => {
  const parsedTreeId = parseTreeId(treeId);
  const person = await prisma.person.findFirst({
    where: {
      id: personId,
      treeId: parsedTreeId,
      tree: { createdBy: req.user.id },
    },
  });

  if (!person) {
    throw new AppError("Person not found", 404);
  }

  return person;
};

const getPersonById = async (personId, req) => {
  const person = await prisma.person.findFirst({
    where: {
      id: personId,
      tree: { createdBy: req.user.id },
    },
  });

  if (!person) {
    throw new AppError("Person not found", 404);
  }

  return person;
};

const updatePerson = async (personId, input, req) => {
  const existing = await prisma.person.findFirst({
    where: {
      id: personId,
      tree: { createdBy: req.user.id },
    },
  });

  if (!existing) {
    throw new AppError("Person not found", 404);
  }

  const payload = buildUpdatePayload(input);
  if (input.fullName && input.fullName !== existing.fullName) {
    payload.slug = await generateUniquePersonSlug(existing.treeId, input.fullName);
  }

  const person = await prisma.person.update({
    where: { id: personId },
    data: payload,
  });

  return person;
};

const deletePerson = async (personId, req) => {
  const existing = await prisma.person.findFirst({
    where: {
      id: personId,
      tree: { createdBy: req.user.id },
    },
  });

  if (!existing) {
    throw new AppError("Person not found", 404);
  }

  const person = await prisma.person.delete({
    where: { id: personId },
  });

  return person;
};

export default {
  createPerson,
  getAllPeople,
  getPersonInTree,
  getPersonById,
  updatePerson,
  deletePerson,
};
