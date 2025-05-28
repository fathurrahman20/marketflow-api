import { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import { bearerAuth } from "hono/bearer-auth";
import { HTTPException } from "hono/http-exception";
import { prisma } from "../application/database";
import { JWTPayload } from "hono/utils/jwt/types";
import { getSignedCookie } from "hono/cookie";

export interface AppVariables extends JWTPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  exp: number;
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authToken = await getSignedCookie(
    c,
    Bun.env.COOKIE_SECRET!,
    "auth_token"
  );
  const refreshToken = await getSignedCookie(
    c,
    Bun.env.COOKIE_SECRET!,
    "refresh_token"
  );

  if (!authToken || !refreshToken) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const payload = (await verify(
    authToken,
    Bun.env.ACCESS_TOKEN_SECRET!
  )) as AppVariables;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }
  c.set("user", payload);

  await next();
};
