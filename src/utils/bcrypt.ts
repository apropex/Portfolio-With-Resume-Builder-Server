import { compare, genSalt, hash } from "bcryptjs";
import httpStatus from "http-status";
import _env from "../config";
import ApiError from "../error-handler/ApiError";

//

export async function buildHash(password: string): Promise<string> {
  const salt = await genSalt(_env.bcrypt_salt);
  return await hash(password, salt);
}

export async function compareHash(
  password: string,
  hash: string,
  message = "Invalid credentials",
): Promise<boolean> {
  const isValidate = await compare(password, hash);
  if (!isValidate) throw new ApiError(httpStatus.BAD_REQUEST, message);
  return isValidate;
}
