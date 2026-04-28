import slugify from "slugify";
import prisma from "../config/prisma.js";


async function generateUniqueTreeSlug(name) {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true
  });

  let slug = baseSlug;
  let counter = 1;
// eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.trees.findUnique({
      where: { slug }
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function generateUniquePersonSlug(treeId, name) {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;
// eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.person.findFirst({
      where: {
        treeId,
        slug,
      },
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export   {
    generateUniqueTreeSlug,
    generateUniquePersonSlug,
}