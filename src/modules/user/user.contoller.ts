import { type Request, type Response } from "express";
import { UserService } from "./user.service.js";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await UserService.getAllUsers();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const result = await UserService.getUserById(req.params.id!);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.updateUser(req.params.id!, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.deleteUser(req.params.id!);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const UserController = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
