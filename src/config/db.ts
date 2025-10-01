import { Prisma, PrismaClient } from "@prisma/client";

type Delegate = Prisma.UserDelegate | Prisma.BlogDelegate;

type PrismaOperations<T extends Delegate> = {
  FindUnique: T["findUnique"];
  Delete: T["delete"];
  FindMany: T["findMany"];
  Create: T["create"];
  Update: T["update"];
  Count: T["count"];
};

const prisma = new PrismaClient();

export function PrismaOptions<T extends Delegate>(
  param: T,
): PrismaOperations<T> {
  const {
    findUnique: FindUnique,
    delete: Delete,
    findMany: FindMany,
    create: Create,
    update: Update,
    count: Count,
  } = param;

  return { FindUnique, Delete, FindMany, Create, Update, Count };
}

export default prisma;
