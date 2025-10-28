import express from "express";
import { uploadImage } from "../../../config/cloudinary/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { UserController } from "./user.controller";

const router = express.Router();

router.get("/", UserController.getAllUsers);

router.post(
  "/",
  uploadImage.single("file"),
  validateRequest,
  UserController.createUser,
);

router.get("/:id", UserController.getUserById);

router.patch("/:id", UserController.updateUser);

router.delete("/:id", UserController.deleteUser);

export const userRouter = router;
