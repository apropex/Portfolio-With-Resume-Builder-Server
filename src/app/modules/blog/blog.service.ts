import type { Blog, Prisma } from "@prisma/client";
import { deleteImageFromCloud } from "../../../config/cloudinary/deleteImageFromCloud";
import { prisma } from "../../../config/db";

const _blog = prisma.blog;

export interface iGetAllBlogsParams {
  page?: string;
  limit?: string;
  search?: string;
}

const createBlog = async (payload: Prisma.BlogCreateInput): Promise<Blog> => {
  const result = await _blog.create({
    data: payload,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return result;
};

export const getAllBlogs = async (query: iGetAllBlogsParams) => {
  const search = query.search;
  const page = Number(query.page || "1");
  const limit = Number(query.limit || "12");
  const skip = (page - 1) * limit;

  const where: Prisma.BlogWhereInput = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
      { tags: { has: search.toLowerCase() } },
    ];
  }

  const [data, totalDataCount, filteredCount] = await Promise.all([
    _blog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    _blog.count(),
    _blog.count({ where }),
  ]);

  return {
    data,
    meta: {
      total_data: totalDataCount,
      filtered_data: filteredCount,
      total_page: Math.ceil(filteredCount / limit),
      present_page: page,
      skip,
      limit,
      present_data: Math.min(
        limit,
        filteredCount - skip > 0 ? filteredCount - skip : 0,
      ),
    },
  };
};

const getBlogById = async (id: string) => {
  return await _blog.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

type iUpdateBlog = Blog & { deletedImages?: string[] };

const updateBlog = async (id: string, payload: iUpdateBlog) => {
  return await prisma.$transaction(async (trx) => {
    const existingBlog = await trx.blog.findFirstOrThrow({
      where: { id, isDeleted: false },
    });

    const oldImages = existingBlog.images || [];
    const delImages = payload.deletedImages || [];
    const images = payload.images || [];

    const remainingImages = oldImages.filter((img) => !delImages.includes(img));
    payload.images = [...images, ...remainingImages];

    const updatedBlog = await _blog.update({ where: { id }, data: payload });

    if (delImages.length > 0) {
      await Promise.all(delImages.map((url) => deleteImageFromCloud(url)));
    }

    return updatedBlog;
  });
};

const deleteBlog = async (id: string) => {
  return _blog.delete({ where: { id } });
};

export const BlogService = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
