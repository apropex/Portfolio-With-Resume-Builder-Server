import { type Request, type Response } from "express";
import { BlogService, type iGetAllBlogsParams } from "./blog.service.js";

const createBlog = async (req: Request, res: Response) => {
  try {
    const result = await BlogService.createBlog(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
      : undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    const result = await BlogService.getAllBlogs({
      page,
      limit,
      search,
      isFeatured,
      tags,
    } as iGetAllBlogsParams);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts", details: err });
  }
};

const getBlogById = async (req: Request, res: Response) => {
  const post = await BlogService.getBlogById(req.params.id!);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
};

const updateBlog = async (req: Request, res: Response) => {
  const post = await BlogService.updateBlog(req.params.id!, req.body);
  res.json(post);
};

const deleteBlog = async (req: Request, res: Response) => {
  await BlogService.deleteBlog(req.params.id!);
  res.json({ message: "Post deleted" });
};

/*
const getBlogStat = async (req: Request, res: Response) => {
  try {
    const result = await PostService.getBlogStat();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats", details: err });
  }
};
*/

export const BlogController = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  // getBlogStat,
};
