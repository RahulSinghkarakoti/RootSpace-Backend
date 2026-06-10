import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import uploadService from "./upload.service.js";
const parsePersonId = (value) => {
  if (!value || typeof value !== "string") {
    throw new AppError("Invalid person id", 400);
  }
  return value;
};

const parseEducationId = (value) => {
  if (!value || typeof value !== "string") {
    throw new AppError("Invalid education id", 400);
  }
  return value;
};

const ensurePersonOwnership = async (personId, userId) => {
  const person = await prisma.person.findFirst({
    where: {
      id: personId,
      tree: { createdBy: userId },
    },
    select: { id: true, treeId: true },
  });

  if (!person) {
    throw new AppError("Person not found or access denied", 404);
  }

  return person;
};

const buildEducationPayload = (input) => ({
  title: input.title,
  institution: input.institution,
  level: input.level,
  startDate: Object.prototype.hasOwnProperty.call(input, "startDate")
    ? input.startDate
      ? new Date(input.startDate)
      : null
    : undefined,
  endDate: Object.prototype.hasOwnProperty.call(input, "endDate")
    ? input.endDate
      ? new Date(input.endDate)
      : null
    : undefined,
  description: Object.prototype.hasOwnProperty.call(input, "description") ? input.description : undefined,
  degreeUrl: Object.prototype.hasOwnProperty.call(input, "degreeUrl") ? input.degreeUrl : undefined,
});

const createEducation = async (personId, input, req) => {
  const parsedPersonId = parsePersonId(personId);
  await ensurePersonOwnership(parsedPersonId, req.user.id);

  const education = await prisma.educationEntry.create({
    data: {
      personId: parsedPersonId,
      ...buildEducationPayload(input),
    },
  });

  return education;
};

const getPersonEducation = async (personId, req) => {
  const parsedPersonId = parsePersonId(personId);
  await ensurePersonOwnership(parsedPersonId, req.user.id);

  const entries = await prisma.educationEntry.findMany({
    where: { personId: parsedPersonId },
    orderBy: { startDate: "desc" },
  });

  return entries;
};

const getEducationById = async (educationId, req) => {
  const id = parseEducationId(educationId);
  const entry = await prisma.educationEntry.findFirst({
    where: {
      id,
      person: { tree: { createdBy: req.user.id } },
    },
  });

  if (!entry) {
    throw new AppError("Education entry not found", 404);
  }

  return entry;
};

const updateEducation = async (educationId, input, req) => {
  const id = parseEducationId(educationId);
  const existing = await prisma.educationEntry.findFirst({
    where: {
      id,
      person: { tree: { createdBy: req.user.id } },
    },
  });

  if (!existing) {
    throw new AppError("Education entry not found", 404);
  }
  if (input.degreeUrl) {
    const oldDegreeUrl = existing.degreeUrl;
    if (oldDegreeUrl && oldDegreeUrl !== input.degreeUrl) {
      await uploadService.deleteCloudinaryImage(oldDegreeUrl);
    }
  }
  const payload = buildEducationPayload(input);
  const education = await prisma.educationEntry.update({
    where: { id },
    data: {
      ...payload,
    },
  });

  return education;
};

const deleteEducation = async (educationId, req) => {
  const id = parseEducationId(educationId);
  const existing = await prisma.educationEntry.findFirst({
    where: {
      id,
      person: { tree: { createdBy: req.user.id } },
    },
  });

  if (!existing) {
    throw new AppError("Education entry not found", 404);
  }

  const education = await prisma.educationEntry.delete({
    where: { id },
  });

  return education;
};

export default {
  createEducation,
  getPersonEducation,
  getEducationById,
  updateEducation,
  deleteEducation,
};
