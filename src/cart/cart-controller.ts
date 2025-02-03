import { Context, Hono } from "hono";
import { AppVariables, authMiddleware } from "../middleware/auth-middleware";
import { User } from "@prisma/client";
import { CartService } from "./cart-service";

const app = new Hono<{ Variables: AppVariables }>();

app.use(authMiddleware);

app.get("/", async (c: Context) => {
  const user = c.get("user") as User;

  const response = await CartService.get(user);

  return c.json({
    success: true,
    message: "Successfully get cart",
    data: response,
  });
});

app.post("/", async (c: Context) => {
  const user = c.get("user") as User;
  const request = await c.req.json();

  const response = await CartService.create(user, request);

  return c.json(
    {
      success: true,
      message: "Successfully create cart",
      data: response,
    },
    201
  );
});

app.delete("/:id", async (c: Context) => {
  const user = c.get("user") as User;
  const id = c.req.param("id");

  const response = await CartService.delete(user, id);

  return c.json({
    success: true,
    message: "Successfully delete cart",
    data: response,
  });
});

export default app;
