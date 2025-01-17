import { HTTPException } from "hono/http-exception";
import { prisma } from "../application/database";
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  userResponse,
} from "./user-model";
import { UserValidation } from "./user-validation";
import { sign, verify } from "hono/jwt";
import { User } from "@prisma/client";
import { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { AppVariables } from "../middleware/auth-middleware";

export class UserService {
  static async register(request: RegisterUserRequest) {
    request = UserValidation.REGISTER.parse(request);

    const findUser = await prisma.user.findUnique({
      where: { email: request.email },
    });

    if (findUser) {
      throw new HTTPException(400, {
        message: "User already exists",
      });
    }

    request.password = await Bun.password.hash(request.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const user = await prisma.user.create({
      data: request,
    });

    const newUser: Partial<User> = {
      ...user,
      password: undefined,
    };
    return newUser;
  }

  static async login(c: Context, request: LoginUserRequest) {
    request = UserValidation.LOGIN.parse(request);

    const user = await prisma.user.findUnique({
      where: { email: request.email },
    });

    if (!user) {
      throw new HTTPException(401, {
        message: "Email or password is wrong",
      });
    }

    const isPasswordCorrect = await Bun.password.verify(
      request.password,
      user.password,
      "bcrypt"
    );

    if (!isPasswordCorrect) {
      throw new HTTPException(401, {
        message: "Email or password is wrong",
      });
    }

    const accessTokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tokenOrigin: "/api/users/login",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    };

    // payload for refresh token
    const refreshTokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tokenOrigin: "/api/users/login",
      exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, // 7 days
    };

    // create access token
    const accessToken = await sign(
      accessTokenPayload,
      Bun.env.ACCESS_TOKEN_SECRET!
    );

    // create refresh token
    const refreshToken = await sign(
      refreshTokenPayload,
      Bun.env.REFRESH_TOKEN_SECRET!
    );

    await setSignedCookie(
      c,
      "auth_token",
      accessToken,
      Bun.env.COOKIE_SECRET!,
      {
        path: "/",
        httpOnly: true,
        maxAge: 24 * 60 * 60, // 1 day in seconds
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day/24 hours from now
        sameSite: "Lax",
      }
    );

    // create cookie containing refresh token
    await setSignedCookie(
      c,
      "refresh_token",
      refreshToken,
      Bun.env.COOKIE_SECRET!,
      {
        path: "/",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60, // 7 day in seconds
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        sameSite: "Lax",
      }
    );

    return accessTokenPayload;
  }

  static async refresh(c: Context) {
    // Get ref_token from cookie
    const refreshToken = await getSignedCookie(
      c,
      Bun.env.COOKIE_SECRET!,
      "refresh_token"
    );

    if (!refreshToken) {
      throw new HTTPException(401, {
        message: "No refresh token",
      });
    }

    const payload = (await verify(
      refreshToken,
      Bun.env.REFRESH_TOKEN_SECRET!
    )) as AppVariables;
    const { id, name, email, role } = payload;

    const payloadAccessToken = {
      id,
      name,
      email,
      role,
      tokenOrigin: "/api/users/refresh",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    };

    const payloadRefreshToken = {
      id,
      name,
      email,
      role,
      tokenOrigin: "/api/users/refresh",
      exp: Math.floor(Date.now() / 1000) + 7 * 60 * 60 * 24, // 7 day
    };

    const newAccessToken = await sign(
      payloadAccessToken,
      Bun.env.ACCESS_TOKEN_SECRET!
    );
    const newRefreshToken = await sign(
      payloadRefreshToken,
      Bun.env.REFRESH_TOKEN_SECRET!
    );

    // Set new token in cookies
    await setSignedCookie(
      c,
      "auth_token",
      newAccessToken,
      Bun.env.COOKIE_SECRET!,
      {
        path: "/",
        httpOnly: true,
        maxAge: 24 * 60 * 60, // 1 day in seconds
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day/24 hours from now
        sameSite: "Strict",
      }
    );

    await setSignedCookie(
      c,
      "refresh_token",
      newRefreshToken,
      Bun.env.COOKIE_SECRET!,
      {
        path: "/",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60, // 7 day in seconds
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        sameSite: "Strict",
      }
    );

    return true;
  }

  static async update(user: User, c: Context, request: UpdateUserRequest) {
    request = UserValidation.UPDATE.parse(request);

    if (request.name) {
      user.name = request.name;
    }

    if (request.password) {
      user.password = await Bun.password.hash(request.password, {
        algorithm: "bcrypt",
        cost: 10,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        password: user.password,
      },
    });
    // create new access token with updated data
    const accessTokenPayload = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      tokenOrigin: "/api/users/update",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    };

    // create new refresh token
    const refreshTokenPayload = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      tokenOrigin: "/api/users/update",
      exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, // 7 days
    };

    const accessToken = await sign(
      accessTokenPayload,
      Bun.env.ACCESS_TOKEN_SECRET!
    );

    const refreshToken = await sign(
      refreshTokenPayload,
      Bun.env.REFRESH_TOKEN_SECRET!
    );

    // Set the updated access token in cookie
    await setSignedCookie(
      c,
      "auth_token",
      accessToken,
      Bun.env.COOKIE_SECRET!,
      {
        path: "/",
        httpOnly: true,
        maxAge: 24 * 60 * 60, // 1 day
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        sameSite: "Strict",
      }
    );

    // Set the updated refresh token in cookie
    await setSignedCookie(
      c,
      "refresh_token",
      refreshToken,
      Bun.env.COOKIE_SECRET!,
      {
        path: "/",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60, // 7 days
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        sameSite: "Strict",
      }
    );

    return userResponse(updatedUser);
  }

  static async logout(c: Context) {
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

    deleteCookie(c, "auth_token", {
      path: "/",
      httpOnly: true,
    });

    deleteCookie(c, "refresh_token", {
      path: "/",
      httpOnly: true,
    });

    return true;
  }
}
