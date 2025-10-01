import type { Blog, Prisma } from "@prisma/client";
import prisma, { PrismaOptions } from "../../config/db.js";

const { FindUnique, Delete, FindMany, Create, Update, Count } = PrismaOptions(
  prisma.blog,
);

export interface iGetAllBlogsParams {
  page?: number;
  limit?: number;
  search?: string;
  isFeatured?: boolean;
  tags?: string[];
}

const createBlog = async (payload: Prisma.BlogCreateInput): Promise<Blog> => {
  const result = await Create({
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

const getAllBlogs = async ({
  page = 1,
  limit = 10,
  search,
  isFeatured,
  tags,
}: iGetAllBlogsParams) => {
  const skip = (page - 1) * limit;

  const where: any = {
    AND: [
      search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      },
      typeof isFeatured === "boolean" && { isFeatured },
      tags && tags.length > 0 && { tags: { hasEvery: tags } },
    ].filter(Boolean),
  };

  const result = await FindMany({
    skip,
    take: limit,
    where,
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await Count({ where });

  return {
    data: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getBlogById = async (id: string) => {
  // return await prisma.$transaction(async (tx) => {
  //   return await tx.blog.findUnique({
  //     where: { id },
  //     include: { author: true },
  //   });
  // });

  return await FindUnique({
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

const updateBlog = async (id: string, data: Partial<any>) => {
  return Update({ where: { id }, data });
};

const deleteBlog = async (id: string) => {
  return Delete({ where: { id } });
};

/*
const getBlogStat = async () => {
    return await prisma.$transaction(async (tx) => {
        const aggregates = await tx.blog.aggregate({
            _count: true,
            _sum: { views: true },
            _avg: { views: true },
            _max: { views: true },
            _min: { views: true },
        })

        const featuredCount = await tx.blog.count({
            where: {
                isFeatured: true
            }
        });

        const topFeatured = await tx.blog.findFirst({
            where: { isFeatured: true },
            orderBy: { views: "desc" }
        })

        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7)

        const lastWeekBlogCount = await tx.blog.count({
            where: {
                createdAt: {
                    gte: lastWeek
                }
            }
        })

        return {
            stats: {
                totalPosts: aggregates._count ?? 0,
                totalViews: aggregates._sum.views ?? 0,
                avgViews: aggregates._avg.views ?? 0,
                minViews: aggregates._min.views ?? 0,
                maxViews: aggregates._max.views ?? 0
            },
            featured: {
                count: featuredCount,
                topPost: topFeatured,
            },
            lastWeekPostCount
        };
    })
}
    */

export const BlogService = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  // getBlogStat
};
