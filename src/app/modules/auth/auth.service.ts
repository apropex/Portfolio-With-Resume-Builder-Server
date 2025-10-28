import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/db";
import { compareHash } from "../../../utils/bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt";

const _user = prisma.user;

const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  //
  const user = await _user.findFirstOrThrow({
    where: { email, isDeleted: false },
  });
  await compareHash(password, user.password || "");

  const access_token = generateAccessToken(user);
  const refresh_token = generateRefreshToken(user);

  return { data: user, access_token, refresh_token };
};

const authWithGoogle = async (data: Prisma.UserCreateInput) => {
  let user = await _user.findUnique({
    where: { email: data.email, isDeleted: false },
  });

  if (!user) user = await _user.create({ data });

  const access_token = generateAccessToken(user);
  const refresh_token = generateRefreshToken(user);

  return { data: user, access_token, refresh_token };
};

export const AuthService = {
  login,
  authWithGoogle,
};
