import { Hono } from "hono";
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
} from "./user-model";
import { UserService } from "./user-service";
import { setCookie, setSignedCookie } from "hono/cookie";
import { AppVariables, authMiddleware } from "../middleware/auth-middleware";
import { User } from "@prisma/client";

const app = new Hono<{ Variables: AppVariables }>();

app.post("/", async (c) => {
  const request = (await c.req.json()) as RegisterUserRequest;

  const response = await UserService.register(request);

  return c.json(
    {
      success: true,
      message: "User registered successfully",
      data: response,
    },
    201
  );
});

app.post("/login", async (c) => {
  const request = (await c.req.json()) as LoginUserRequest;

  const response = await UserService.login(c, request);

  return c.json(
    {
      success: true,
      message: "User login successfully",
      data: response,
    },
    200
  );
});

app.use(authMiddleware);

app.get("/current", async (c) => {
  const user = c.get("user") as User;

  return c.json({
    data: user,
  });
});

app.get("/refresh", async (c) => {
  const response = await UserService.refresh(c);

  return c.json({
    success: true,
    message: "get refresh token successfully",
    data: response,
  });
});

app.patch("/current", async (c) => {
  const user = c.get("user") as User;
  const request = (await c.req.json()) as UpdateUserRequest;

  const response = await UserService.update(user, c, request);

  return c.json({
    success: true,
    message: "Update successfully",
    data: response,
  });
});

app.delete("/current", async (c) => {
  const response = await UserService.logout(c);

  return c.json({
    success: true,
    message: "Logout successfully",
    data: response,
  });
});

export default app;
