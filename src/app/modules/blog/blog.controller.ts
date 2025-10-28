import catchAsync from "../../shared/catchAsync";
import _response from "../../shared/sendResponse";
import { BlogService } from "./blog.service";

const createBlog = catchAsync(async (req, res) => {
  const result = await BlogService.createBlog(req.body);
  _response(res, {
    message: "Blog created successfully!",
    data: result,
  });
});

const getAllBlogs = catchAsync(async (req, res) => {
  const result = await BlogService.getAllBlogs(req.query);
  _response(res, {
    message: "Blogs retrieved successfully!",
    data: result,
  });
});

const getBlogById = catchAsync(async (req, res) => {
  const result = await BlogService.getBlogById(req.params.id!);
  _response(res, {
    message: "Blog retrieved successfully!",
    data: result,
  });
});

const updateBlog = catchAsync(async (req, res) => {
  const result = await BlogService.updateBlog(req.params.id!, req.body);
  _response(res, {
    message: "Blog updated successfully!",
    data: result,
  });
});

const deleteBlog = catchAsync(async (req, res) => {
  await BlogService.deleteBlog(req.params.id!);
  _response(res, {
    message: "Blog deleted successfully!",
  });
});

export const BlogController = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
