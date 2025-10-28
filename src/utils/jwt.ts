import { User } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import _env from "../config";

type UserPayload = Partial<User> & { secondaryId?: string };

const payloadMaker = ({
  id,
  name,
  email,
  image,
  role,
  isVerified,
}: UserPayload) => {
  return { id, name, email, image, role, isVerified };
};

//* GENERATE ACCESS TOKEN
export const generateAccessToken = (
  userPayload: UserPayload,
  { secretKey, period }: { secretKey?: string; period?: string } = {},
) => {
  //

  const payload = payloadMaker(userPayload);
  const secret = secretKey || _env.jwt.access_token_secret;
  const options = {
    expiresIn: period || _env.jwt.access_token_expire_time,
  } as jwt.SignOptions;

  const access_token = jwt.sign(payload, secret, options);

  if (!access_token) throw new Error("Failed to generate access token");

  return access_token;
};

//* GENERATE REFRESH TOKEN
export const generateRefreshToken = (
  userPayload: UserPayload,
  { secretKey, period }: { secretKey?: string; period?: string } = {},
) => {
  //

  const payload = payloadMaker(userPayload);
  const secret = secretKey || _env.jwt.refresh_token_secret;
  const options = {
    expiresIn: period || _env.jwt.refresh_token_expire_time,
  } as jwt.SignOptions;

  const refresh_token = jwt.sign(payload, secret, options);

  if (!refresh_token) throw new Error("Failed to generate refresh token");

  return refresh_token;
};

//* VERIFY ACCESS TOKEN
export const verifyAccessToken = (token: string): jwt.JwtPayload => {
  const accessToken = jwt.verify(
    token,
    _env.jwt.access_token_secret,
  ) as jwt.JwtPayload;
  if (!accessToken) throw new Error("Token is not valid");
  return accessToken;
};

//* VERIFY REFRESH TOKEN
export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  const refreshToken = jwt.verify(
    token,
    _env.jwt.refresh_token_secret,
  ) as jwt.JwtPayload;
  if (!refreshToken) throw new Error("Token is not valid");
  return refreshToken;
};
