import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { getTreeShareRights, hasTreeShareRight } from "../utils/treeSharePermissions.js";
import personService from "./person.service.js";

const sanitizeToken = (token) => {
  const value = String(token || "").trim();
  if (!value) throw new AppError("Share token is required", 400);
  return value;
};

const normalizePerson = ({ educationTimeline, gallery, ...person }) => ({
  ...person,
  education: educationTimeline ?? [],
  media: gallery ?? [],
});

const buildUpdatePayload = (input) => {
  const payload = {};
  if (Object.prototype.hasOwnProperty.call(input, "fullName")) payload.fullName = input.fullName;
  if (Object.prototype.hasOwnProperty.call(input, "gender")) payload.gender = input.gender || null;
  if (Object.prototype.hasOwnProperty.call(input, "birthDate")) payload.birthDate = input.birthDate ? new Date(input.birthDate) : null;
  if (Object.prototype.hasOwnProperty.call(input, "deathDate")) payload.deathDate = input.deathDate ? new Date(input.deathDate) : null;
  if (Object.prototype.hasOwnProperty.call(input, "notes")) payload.notes = input.notes || null;
  if (Object.prototype.hasOwnProperty.call(input, "birthPlace")) payload.birthPlace = input.birthPlace || null;
  if (Object.prototype.hasOwnProperty.call(input, "avatarUrl")) payload.avatarUrl = input.avatarUrl || null;
  return payload;
};

async function verifyShareToken(token, req) {
  const shareToken = await prisma.treeShareToken.findUnique({
    where: { token: sanitizeToken(token) },
    include: {
      tree: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          createdBy: true,
          _count: { select: { persons: true } },
        },
      },
    },
  });

  if (!shareToken || !shareToken.isActive) {
    throw new AppError("Share link is invalid or inactive", 404);
  }

  if (shareToken.expiresAt && shareToken.expiresAt < new Date()) {
    throw new AppError("Share link has expired", 410);
  }

  const member = await prisma.treeShareMember.upsert({
    where: {
      tokenId_userId: {
        tokenId: shareToken.id,
        userId: req.user.id,
      },
    },
    create: {
      tokenId: shareToken.id,
      userId: req.user.id,
    },
    update: {
      updatedAt: new Date(),
    },
    select: {
      id: true,
      tokenId: true,
      userId: true,
      addedPersonsCount: true,
      joinedAt: true,
      updatedAt: true,
    },
  });

  return {
    token: shareToken.token,
    tree: shareToken.tree,
    permission: shareToken.permission,
    rights: getTreeShareRights(shareToken.permission),
    personLimit: shareToken.personLimit,
    expiresAt: shareToken.expiresAt,
    member,
  };
}

async function getSharedTreeData(token, req) {
  const access = await verifyShareToken(token, req);
  const [people, relations, media] = await Promise.all([
    prisma.person.findMany({
      where: { treeId: access.tree.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        avatarUrl: true,
        fullName: true,
        gender: true,
        birthDate: true,
        birthPlace: true,
        deathDate: true,
        notes: true,
        createdByMemberId: true,
        createdAt: true,
        updatedAt: true,
        educationTimeline: { orderBy: { startDate: "desc" } },
        gallery: true,
      },
    }),
    prisma.relation.findMany({
      where: { treeId: access.tree.id, isActive: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.media.findMany({
      where: { treeId: access.tree.id },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return {
    ...access,
    people: people.map(normalizePerson),
    relations,
    media, 
  };
}

async function createSharedPerson(token, input, req) {
  const access = await verifyShareToken(token, req);
  if (!hasTreeShareRight(access.permission, "add_person")) {
    throw new AppError("This share link does not allow adding people", 403);
  }

  if (
    Number.isInteger(access.personLimit) &&
    access.member.addedPersonsCount >= access.personLimit
  ) {
    throw new AppError("Person limit reached for this share link", 403);
  }

  req.shareAccess = {
    treeId: access.tree.id,
    tokenId: access.member.tokenId,
    memberId: access.member.id,
    permission: access.permission,
    rights: access.rights,
    personLimit: access.personLimit,
    addedPersonsCount: access.member.addedPersonsCount,
  };

  return personService.createPerson(access.tree.id, input, req);
}

async function updateSharedPerson(token, personId, input, req) {
  const access = await verifyShareToken(token, req);
  const canEditAny = hasTreeShareRight(access.permission, "edit_any");
  const canEditOwn = hasTreeShareRight(access.permission, "edit_own");

  if (!canEditAny && !canEditOwn) {
    throw new AppError("This share link does not allow editing people", 403);
  }

  const existing = await prisma.person.findFirst({
    where: {
      id: personId,
      treeId: access.tree.id,
    },
    select: {
      id: true,
      treeId: true,
      createdByMemberId: true,
    },
  });

  if (!existing) {
    throw new AppError("Person not found", 404);
  }

  if (!canEditAny && existing.createdByMemberId !== access.member.id) {
    throw new AppError("This share link can only edit people added through your membership", 403);
  }

  return prisma.person.update({
    where: { id: personId },
    data: buildUpdatePayload(input),
    select: {
      id: true,
      slug: true,
      avatarUrl: true,
      fullName: true,
      gender: true,
      birthDate: true,
      birthPlace: true,
      deathDate: true,
      notes: true,
      createdByMemberId: true,
      createdAt: true,
      updatedAt: true,
      educationTimeline: { orderBy: { startDate: "desc" } },
      gallery: true,
    },
  }).then(normalizePerson);
}
async function deleteSharedPerson(token, personId, req) {
  const access = await verifyShareToken(token, req);
  const canEditAny = hasTreeShareRight(access.permission, "edit_any");
  const canEditOwn = hasTreeShareRight(access.permission, "edit_own");

  if (!canEditAny && !canEditOwn) {
    throw new AppError("This share link does not allow deleting people", 403);
  }

  const existing = await prisma.person.findFirst({
    where: {
      id: personId,
      treeId: access.tree.id,
    },
    select: {
      id: true,
      createdByMemberId: true,
    },
  });

  if (!existing) {
    throw new AppError("Person not found", 404);
  }

  if (!canEditAny && existing.createdByMemberId !== access.member.id) {
    throw new AppError("This share link can only delete people added through your membership", 403);
  }

  await prisma.$transaction(async (tx) => {
    await tx.person.delete({
      where: { id: personId },
    });

    if (existing.createdByMemberId === access.member.id && access.member.addedPersonsCount > 0) {
      await tx.treeShareMember.update({
        where: { id: access.member.id },
        data: { addedPersonsCount: { decrement: 1 } },
      });
    }
  });

  return {
    personId,
    decrementAddedCount: existing.createdByMemberId === access.member.id,
  };
}
export default {
  verifyShareToken,
  getSharedTreeData,
  createSharedPerson,
  updateSharedPerson,
   deleteSharedPerson,
};
