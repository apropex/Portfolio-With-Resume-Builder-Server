import express from "express";
import { UserController } from "./user.contoller.js";

const router = express.Router();

router.get("/", UserController.getAllUsers);

router.post("/", UserController.createUser);

router.get("/:id", UserController.getUserById);

router.patch("/:id", UserController.updateUser);

router.delete("/:id", UserController.deleteUser);

export const userRouter = router;
