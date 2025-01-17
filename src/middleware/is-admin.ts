import { MiddlewareHandler } from "hono";
import { getSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import { AppVariables } from "./auth-middleware";
import { prisma } from "../application/database";
import { User } from "@prisma/client";

export const isAdmin: MiddlewareHandler = async (c, next) => {
  const user = c.get("user") as User;

  if (user.role !== "ADMIN") {
    throw new HTTPException(403, { message: "Access denied" });
  }
  await next();
};
