import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export default function zodValidator(schema: ZodObject) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      req.body = await schema.parseAsync(
        req.body?.data ? JSON.parse(req.body.data) : req.body,
      );

      next();
    } catch (error) {
      next(error);
    }
  };
}

export async function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.body = (await req.body?.data) ? JSON.parse(req.body.data) : req.body;
  next();
}
