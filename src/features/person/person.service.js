import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import { generateUniquePersonSlug } from "../../utils/tree.js";

export const ensureTreeOwnership = async (treeId, userId) => {
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
  birthPlace: input.birthPlace || null,
});

const buildUpdatePayload = (input) => {
  const payload = {};
  if (Object.prototype.hasOwnProperty.call(input, 'fullName')) payload.fullName = input.fullName;
  if (Object.prototype.hasOwnProperty.call(input, 'gender')) payload.gender = input.gender || null;
  if (Object.prototype.hasOwnProperty.call(input, 'birthDate')) payload.birthDate = input.birthDate ? new Date(input.birthDate) : null;
  if (Object.prototype.hasOwnProperty.call(input, 'deathDate')) payload.deathDate = input.deathDate ? new Date(input.deathDate) : null;
  if (Object.prototype.hasOwnProperty.call(input, 'notes')) payload.notes = input.notes || null;
  if (Object.prototype.hasOwnProperty.call(input, 'birthPlace')) payload.birthPlace = input.birthPlace || null;
  if (Object.prototype.hasOwnProperty.call(input, 'avatarUrl')) payload.avatarUrl = input.avatarUrl || null;
  return payload;
};

const createPerson = async (treeId, input, req) => {
  const parsedTreeId = parseTreeId(treeId);
  const shareAccess = req.shareAccess?.treeId === parsedTreeId ? req.shareAccess : null;
  if (!shareAccess) {
    await ensureTreeOwnership(parsedTreeId, req.user.id);
  } else if (
    Number.isInteger(shareAccess.personLimit) &&
    shareAccess.addedPersonsCount >= shareAccess.personLimit
  ) {
    throw new AppError("Person limit reached for this share link", 403);
  }
  const unknownSpouse = null;
  // ── Validate relation targets BEFORE creating anything ──────────────────
  if (input.relations?.length > 0) {
    const toIds = [...new Set(input.relations.map(r => r.toId))];

    const existingPersons = await prisma.person.findMany({
      where: { id: { in: toIds }, treeId: parsedTreeId },
      select: { id: true },
    });

    const existingIds = new Set(existingPersons.map(p => p.id));
    const invalidIds = toIds.filter(id => !existingIds.has(id));

    if (invalidIds.length > 0) {
      throw new AppError(`Invalid relation targets: ${invalidIds.join(', ')}`, 400);
    }
  }

  // ── Run everything in a transaction ─────────────────────────────────────
  const person = await prisma.$transaction(async (tx) => {
    const slug = await generateUniquePersonSlug(parsedTreeId, input.fullName);
    const newPerson = await tx.person.create({
      data: {
        treeId: parsedTreeId,
        createdByMemberId: shareAccess?.memberId ?? null,
        slug,
        ...buildCreatePayload(input),
      },
      select: {
        id: true,
        slug: true,
        fullName: true,
        gender: true,
        birthDate: true,
        birthPlace: true,
        deathDate: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!input.relations?.length) return newPerson;

    // ── Build relation pairs ─────────────────────────────────────────────
    // Use a Map keyed by "fromId|toId|type" to prevent duplicates
    const relMap = new Map();

    const addRel = (fromId, toId, type, metadata = null, isActive = true) => {
      // SPOUSE_OF: always store canonical direction (sorted) to avoid duplicates
      // PARENT_OF: directed, no reverse needed
      if (type === 'SPOUSE_OF') {
        const [a, b] = [fromId, toId].sort();
        const key = `${a}|${b}|SPOUSE_OF`;
        if (!relMap.has(key)) {
          relMap.set(key, {
            treeId: parsedTreeId,
            fromId: a,
            toId: b,
            type: 'SPOUSE_OF',
            metadata,
            isActive,
          });
        }
      } else if (type === 'PARENT_OF') {
        const key = `${fromId}|${toId}|PARENT_OF`;
        if (!relMap.has(key)) {
          relMap.set(key, {
            treeId: parsedTreeId,
            fromId,
            toId,
            type: 'PARENT_OF',
            metadata,
            isActive,
          });
        }
      } else if (type === 'SIBLING_OF') {
        const [a, b] = [fromId, toId].sort();
        const key = `${a}|${b}|SIBLING_OF`;
        if (!relMap.has(key)) {
          relMap.set(key, {
            treeId: parsedTreeId,
            fromId: a,
            toId: b,
            type: 'SIBLING_OF',
            metadata,
            isActive,
          });
        }
      }
    };

    // ── Process explicit relations from input ────────────────────────────
    for (const rel of input.relations) {
      const meta = rel.metadata ?? null;
      const active = rel.isActive ?? true;

      if (rel.type === 'SPOUSE_OF') {
        // new person ↔ existing person (symmetric, one record)
        addRel(newPerson.id, rel.toId, 'SPOUSE_OF', meta, active);

      } else if (rel.type === 'PARENT_OF') {
        // rel.toId is the PARENT, new person is the CHILD
        // So: parent -> newPerson
        addRel(rel.toId, newPerson.id, 'PARENT_OF', meta, active);

      } else if (rel.type === 'CHILD_OF') {
        // new person is the PARENT, rel.toId is the CHILD
        // So: newPerson -> child
        addRel(newPerson.id, rel.toId, 'PARENT_OF', meta, active);

      } else if (rel.type === 'SIBLING_OF') {
        addRel(newPerson.id, rel.toId, 'SIBLING_OF', meta, active);
      }
    }

    // ── Auto-link: if new person is added as CHILD of a parent,
    //    link existing spouse as second parent if one exists (no phantom creation) ───────
    const parentOfNewPerson = input.relations
      .filter(r => r.type === 'PARENT_OF') // toId = parent
      .map(r => r.toId);

    if (parentOfNewPerson.length > 0) {
      for (const parentId of parentOfNewPerson) {
        // Find existing spouse of this parent
        const spouseRel = await tx.relation.findFirst({
          where: {
            treeId: parsedTreeId,
            type: 'SPOUSE_OF',
            OR: [
              { fromId: parentId },
              { toId: parentId },
            ],
          },
        });

        if (spouseRel) {
          const secondParentId =
            spouseRel.fromId === parentId
              ? spouseRel.toId
              : spouseRel.fromId;

          const alreadyLinked = await tx.relation.findFirst({
            where: {
              treeId: parsedTreeId,
              type: 'PARENT_OF',
              fromId: secondParentId,
              toId: newPerson.id,
            },
          });

          if (!alreadyLinked) {
            addRel(secondParentId, newPerson.id, 'PARENT_OF');
          }
        }
      }
    }

    // ── If new person is added as SPOUSE_OF,
    //    inherit existing children of spouse ───────────────────────────────
    const spouseTargets = input.relations
      .filter(r => r.type === 'SPOUSE_OF')
      .map(r => r.toId);

    if (spouseTargets.length > 0) {

      for (const spouseId of spouseTargets) {

        // Find all children of existing spouse
        const existingChildren = await tx.relation.findMany({
          where: {
            treeId: parsedTreeId,
            type: 'PARENT_OF',
            fromId: spouseId,
          },
          select: {
            toId: true,
          },
        });

        for (const childRel of existingChildren) {

          // Check whether new spouse already linked
          const alreadyLinked = await tx.relation.findFirst({
            where: {
              treeId: parsedTreeId,
              type: 'PARENT_OF',
              fromId: newPerson.id,
              toId: childRel.toId,
            },
          });

          // If not linked → make new spouse also parent
          if (!alreadyLinked) {
            addRel(newPerson.id, childRel.toId, 'PARENT_OF');

          }
        }

        // OPTIONAL:
        // remove "Unknown Spouse" if one exists

        const unknownSpouseRel = await tx.relation.findFirst({
          where: {
            treeId: parsedTreeId,
            type: 'SPOUSE_OF',
            OR: [
              { fromId: spouseId },
              { toId: spouseId },
            ],
          },
        });

        if (unknownSpouseRel) {

          const unknownId =
            unknownSpouseRel.fromId === spouseId
              ? unknownSpouseRel.toId
              : unknownSpouseRel.fromId;

          const unknownPerson = await tx.person.findUnique({
            where: { id: unknownId },
            select: {
              fullName: true,
            },
          });

          // Remove placeholder spouse
          if (unknownPerson?.fullName === 'Unknown' || unknownPerson?.fullName === 'Unknown Spouse') {

            await tx.relation.deleteMany({
              where: {
                treeId: parsedTreeId,
                type: 'SPOUSE_OF',
                OR: [
                  {
                    fromId: spouseId,
                    toId: unknownId,
                  },
                  {
                    fromId: unknownId,
                    toId: spouseId,
                  },
                ],
              },
            });

            await tx.person.delete({
              where: {
                id: unknownId,
              },
            });
          }
        }
      }
    }

    // ── Insert all relations (skipDuplicates as safety net) ───────────────
    const relationsData = [...relMap.values()];
    let newRelations = [];
    if (relationsData.length > 0) {
      console.log(`Creating ${relationsData.length} relations for person ${newPerson.id}`);
      newRelations = await tx.relation.createManyAndReturn({
        data: relationsData,
        skipDuplicates: true,  // safety net for race conditions
      });
    }

    const createdPersonCount = unknownSpouse ? 2 : 1;
    if (shareAccess) {

      if (
        Number.isInteger(shareAccess.personLimit) &&
        shareAccess.addedPersonsCount + createdPersonCount > shareAccess.personLimit
      ) {
        throw new AppError("Person limit reached for this share link", 403);
      }

      await tx.treeShareMember.update({
        where: { id: shareAccess.memberId },
        data: { addedPersonsCount: { increment: createdPersonCount } },
      });
    }

    return { newPerson, createdRelations: newRelations };
  });

  return { ...person, unknownSpouse };
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
      avatarUrl: true,
      fullName: true,
      gender: true,
      birthDate: true,
      birthPlace: true,
      deathDate: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      educationTimeline: {
        orderBy: { startDate: "desc" },
      },
    },
  });

  return people.map(({ educationTimeline, ...person }) => ({
    ...person,
    education: educationTimeline,
  }));
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
      OR: [
        {
          tree: {
            createdBy: req.user.id,
          },
        },
        {
          createdByMember: {
            userId: req.user.id ?? null,
          },
        },
      ],
    },
  });

  if (!existing) {
    throw new AppError("Person not found", 404);
  }

  if (existing.createdByMemberId) {
    await prisma.treeShareMember.update({
      where: {
        id: existing.createdByMemberId,
      },
      data: {
        addedPersonsCount: { decrement: 1 },
      },
    });
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
