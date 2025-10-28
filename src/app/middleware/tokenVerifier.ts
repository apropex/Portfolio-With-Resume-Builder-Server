import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { sCode } from "../../config";
import ApiError from "../../error-handler/ApiError";
import { verifyAccessToken } from "../../utils/jwt";

export const tokenVerifier = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies._p_access_token;

  try {
    if (!token)
      return next(new ApiError(sCode.UNAUTHORIZED, "Token did not arrive"));
    const decoded = verifyAccessToken(token);

    req.decoded = decoded as JwtPayload;
    next();
  } catch {
    next(new ApiError(sCode.UNAUTHORIZED, "Invalid token"));
  }
};
