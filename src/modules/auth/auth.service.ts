import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma, { PrismaOptions } from "../../config/db.js";

const { FindUnique, Create } = PrismaOptions(prisma.user);

const loginWithEmailAndPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await FindUnique({ where: { email } });
  if (!user) throw new Error("User not found!");
  let isValid = false;

  if (user.password) {
    isValid = await bcrypt.compare(password, user.password);
  }

  if (isValid) return user;
  else throw new Error("Password is incorrect!");
};

const authWithGoogle = async (data: Prisma.UserCreateInput) => {
  let user = await FindUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    user = await Create({
      data,
    });
  }

  return user;
};

export const AuthService = {
  loginWithEmailAndPassword,
  authWithGoogle,
};
