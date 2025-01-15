import { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import { bearerAuth } from "hono/bearer-auth";
import { HTTPException } from "hono/http-exception";
import { prisma } from "../application/database";
import { JWTPayload } from "hono/utils/jwt/types";
import { getSignedCookie } from "hono/cookie";

export interface AppVariables extends JWTPayload {
  id: number;
  name: string;
  email: string;
  role: string;
  exp: number;
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
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

    console.log("Cek token: ", {
      authToken: authToken ? "true" : "false",
      refreshToken: refreshToken ? "true" : "false",
    });

    if (!authToken || !refreshToken) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const payload = (await verify(
      authToken,
      Bun.env.ACCESS_TOKEN_SECRET!
    )) as AppVariables;
    console.log("Token verified successfully: ", payload);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }
    c.set("user", payload);

    await next();
  } catch (error) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
};
