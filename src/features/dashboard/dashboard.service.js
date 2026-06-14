import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";

/**
 * Get user's owned trees
 */
const getOwnedTrees = async (userId) => {
  const trees = await prisma.trees.findMany({
    where: {
      createdBy: userId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      coverImage: true,
      createdAt: true,
      _count: {
        select: {
          persons: true,
          media: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return trees;
};

/**
 * Get trees shared with the user
 */
const getSharedTrees = async (userId) => {
  const sharedTrees = await prisma.treeShareMember.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      token: {
        select: {
          id: true,
          treeId: true,
          permission: true,
          tree: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              coverImage: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
              _count: {
                select: {
                  persons: true,
                  media: true,
                },
              },
            },
          },
        },
      },
      joinedAt: true,
      addedPersonsCount: true,
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  // Transform the nested structure
  return sharedTrees.map((share) => ({
    shareId: share.id,
    permission: share.token.permission,
    tree: share.token.tree,
    joinedAt: share.joinedAt,
    addedPersonsCount: share.addedPersonsCount,
  }));
};

/**
 * Get recent activities across user's trees and shared trees
 */
const getRecentActivities = async (userId, limit = 20) => {
  // Get user's owned tree IDs and shared tree IDs
  const ownedTrees = await prisma.trees.findMany({
    where: { createdBy: userId },
    select: { id: true },
  });

  const sharedTreeIds = await prisma.treeShareMember.findMany({
    where: { userId },
    select: {
      token: {
        select: {
          treeId: true,
        },
      },
    },
  });

  const treeIds = [
    ...ownedTrees.map((t) => t.id),
    ...sharedTreeIds.map((s) => s.token.treeId),
  ];

  if (treeIds.length === 0) {
    return [];
  }

  // Get recent audit logs for these trees
  const activities = await prisma.auditLog.findMany({
    where: {
      userId: userId,
      OR: [
        { entity: "Tree", entityId: { in: treeIds.map((id) => String(id)) } },
        { entity: "Person" },
        { entity: "Media" },
        { entity: "Relation" },
      ],
    },
    select: {
      id: true,
      action: true,
      entity: true,
      entityId: true,
      createdAt: true,
      metadata: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return activities;
};

/**
 * Get KPIs (Key Performance Indicators) for the user's dashboard
 */
const getKPIs = async (userId) => {
  // Get user's owned trees
  const ownedTrees = await prisma.trees.findMany({
    where: { createdBy: userId },
    select: { id: true },
  });

  const ownedTreeIds = ownedTrees.map((t) => t.id);

  // Get shared trees
  const sharedTreeIds = await prisma.treeShareMember.findMany({
    where: { userId },
    select: {
      token: {
        select: {
          treeId: true,
        },
      },
    },
  });

  const sharedIds = sharedTreeIds.map((s) => s.token.treeId);
  const allTreeIds = [...ownedTreeIds, ...sharedIds];

  // Count statistics
  const [totalOwnedTrees, totalSharedTrees, totalPersons, totalMedia, totalCollaborators] =
    await Promise.all([
      prisma.trees.count({
        where: { createdBy: userId },
      }),
      prisma.treeShareMember.count({
        where: { userId },
      }),
      prisma.person.count({
        where: {
          treeId: { in: allTreeIds },
        },
      }),
      prisma.media.count({
        where: {
          treeId: { in: allTreeIds },
        },
      }),
      prisma.treeShareMember.findMany({
        where: {
          token: {
            treeId: { in: ownedTreeIds },
          },
        },
        distinct: ["userId"],
        select: {
          userId: true,
        },
      }),
    ]);

  return {
    totalOwnedTrees,
    totalSharedTrees,
    totalPersons,
    totalMedia,
    totalCollaborators: totalCollaborators.length,
  };
};

/**
 * Get complete dashboard data for a user
 */
const getDashboardData = async (req) => {
  const userId = req.user.id;

  try {
    const [ownedTrees, sharedTrees, recentActivities, kpis] = await Promise.all([
      getOwnedTrees(userId),
      getSharedTrees(userId),
      getRecentActivities(userId, 15),
      getKPIs(userId),
    ]);

    return {
      ownedTrees,
      sharedTrees,
      recentActivities,
      kpis,
    };
  } catch (error) {
    throw new AppError(
      error.message || "Failed to fetch dashboard data",
      500
    );
  }
};

export default {
  getDashboardData,
  getOwnedTrees,
  getSharedTrees,
  getRecentActivities,
  getKPIs,
};
