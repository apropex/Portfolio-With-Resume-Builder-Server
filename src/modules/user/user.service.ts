import type { Prisma, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma, { PrismaOptions } from "../../config/db.js";

const { FindUnique, Delete, FindMany, Create, Update } = PrismaOptions(
  prisma.user,
);

const createUser = async (
  payload: Prisma.UserCreateInput,
): Promise<Partial<User>> => {
  if (!payload?.email) throw new Error("Email is required");

  let user = await FindUnique({
    where: { email: payload.email },
    omit: { password: true },
  });

  if (!user || !user?.email) {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 13);
    }
    user = await Create({ data: payload, omit: { password: true } });
  }
  return user;
};

const getAllUsers = async () => {
  const result = await FindMany({
    omit: { password: true },
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

const getUserById = async (id: string) => {
  const result = await FindUnique({
    where: {
      id,
    },
    omit: { password: true },
  });
  return result;
};

const updateUser = async (id: string, payload: Partial<User>) => {
  const result = await Update({
    where: {
      id,
    },
    data: payload,
    omit: { password: true },
  });
  return result;
};

const deleteUser = async (id: string) => {
  const result = await Delete({
    where: {
      id,
    },
  });
  return result;
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
