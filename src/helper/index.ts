// const { PrismaClient } = require('@prisma/client');
// const fs = require('fs').promises;
// const path = require('path');

import { Blog, PrismaClient, User } from "@prisma/client";
import fss from "fs";
import path from "path";

const fs = fss.promises;
const prisma = new PrismaClient();

const usersFilePath = path.resolve(
  __dirname,
  "..",
  "..",
  "demo-json",
  "users.json",
);
const blogsFilePath = path.resolve(
  __dirname,
  "..",
  "..",
  "demo-json",
  "blogs.json",
);

// bulk user create
async function createBulkUsers() {
  try {
    const usersData = JSON.parse(await fs.readFile(usersFilePath, "utf-8"));

    const createdUsers = await prisma.user.createMany({
      data: usersData.map((user: User) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        bio: user.bio,
        image: user.image,
        role: user.role,
        isVerified: user.isVerified,
        provider: user.provider,
        providerId: user.providerId,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      })),
      skipDuplicates: true,
    });

    console.log(`successfully ${createdUsers.count}`);
    return createdUsers;
  } catch (error) {
    console.error("Failed to create users:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// bulk blog create
async function createBulkBlogs() {
  try {
    const blogsData = JSON.parse(await fs.readFile(blogsFilePath, "utf-8"));

    const createdBlogs = await prisma.blog.createMany({
      data: blogsData.map((blog: Blog) => ({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        slug: blog.slug,
        authorId: blog.authorId,
        category: blog.category,
        tags: blog.tags,
        images: blog.images,
        published: blog.published,
        publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
        createdAt: new Date(blog.createdAt),
        updatedAt: new Date(blog.updatedAt),
      })),
      skipDuplicates: true,
    });

    console.log(`Successfully create the blogs: ${createdBlogs.count}`);
    return createdBlogs;
  } catch (error) {
    console.error("Failed to create blogs: ", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await createBulkUsers();
  await createBulkBlogs();
}

// main().catch((e) => console.error(e));
