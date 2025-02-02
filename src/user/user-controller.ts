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

app.get("/users", async (c) => {
  const response = await UserService.getUsers();

  return c.json(
    {
      success: true,
      message: "Successfully fetched list of users",
      data: response,
    },
    200
  );
});

app.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  const response = await UserService.getUser(id);

  return c.json(
    {
      success: true,
      message: "Successfully fetched user data",
      data: response,
    },
    200
  );
});

app.post("/auth/register", async (c) => {
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

app.post("/auth/login", async (c) => {
  const request = (await c.req.json()) as LoginUserRequest;

  const response = await UserService.login(c, request);

  return c.json(
    {
      success: true,
      message: "User logged in successfully",
      data: response,
    },
    200
  );
});

app.use(authMiddleware);

app.get("/auth/me", async (c) => {
  const user = c.get("user") as User;

  return c.json({
    success: true,
    message: "Successfully fetched user data",
    data: user,
  });
});

app.get("/auth/refresh", async (c) => {
  const response = await UserService.refresh(c);

  return c.json({
    success: true,
    message: "Successfully refreshed the token",
    data: response,
  });
});

app.patch("/auth/me", async (c) => {
  const user = c.get("user") as User;
  const request = (await c.req.json()) as UpdateUserRequest;

  const response = await UserService.update(user, c, request);

  return c.json({
    success: true,
    message: "User data updated successfully",
    data: response,
  });
});

app.delete("/auth/me", async (c) => {
  const response = await UserService.logout(c);

  return c.json({
    success: true,
    message: "User logged out successfully",
    data: response,
  });
});

export default app;
