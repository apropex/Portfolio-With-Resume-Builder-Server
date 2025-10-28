import type { User } from "@prisma/client";
import { sCode } from "../../../config";
import { prisma } from "../../../config/db";
import ApiError from "../../../error-handler/ApiError";
import { buildHash } from "../../../utils/bcrypt";

const _user = prisma.user;

type iUser = Omit<User, "password"> & { isNew?: boolean; password?: string };

const createUser = async (payload: iUser): Promise<iUser> => {
  if (!payload?.email)
    throw new ApiError(sCode.BAD_REQUEST, "Email is required");

  let user = (await _user.findUnique({
    where: { email: payload.email },
    omit: { password: true },
  })) as iUser;

  if (!user || !user?.email) {
    if (payload.password) payload.password = await buildHash(payload.password);
    user = await _user.create({ data: payload, omit: { password: true } });
    user.isNew = true;
  } else user.isNew = false;

  return user;
};

const getAllUsers = async () => {
  return await _user.findMany({
    omit: { password: true },
    orderBy: { createdAt: "desc" },
  });
};

const getUserById = async (id: string) => {
  return await _user.findUniqueOrThrow({
    where: { id, isDeleted: false },
    omit: { password: true },
  });
};

const updateUser = async (id: string, payload: Partial<User>) => {
  await _user.findFirstOrThrow({ where: { id, isDeleted: false } });
  return await _user.update({
    where: { id },
    data: payload,
    omit: { password: true },
  });
};

const deleteUser = async (id: string) => {
  const result = await _user.update({
    where: { id },
    data: { isDeleted: true },
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
