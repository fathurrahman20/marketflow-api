import { Context, Hono } from "hono";
import { CategoryService } from "./category-service";
import { CreateCategoryRequest, UpdateCategoryRequest } from "./category-model";
import { authMiddleware } from "../middleware/auth-middleware";
import { isAdmin } from "../middleware/is-admin";

const app = new Hono();

app.get("/", async (c: Context) => {
  const response = await CategoryService.get();
  return c.json({
    success: true,
    message: "Successfully get categorys",
    data: response,
  });
});

app.get("/:id", async (c: Context) => {
  const request = Number(c.req.param("id"));
  const response = await CategoryService.getById(request);

  return c.json({
    success: true,
    message: "Successfully get category detail",
    data: response,
  });
});

app.use(authMiddleware);

app.use(isAdmin);

app.post("/", async (c: Context) => {
  const request = (await c.req.json()) as CreateCategoryRequest;
  const response = await CategoryService.create(request);

  return c.json({
    success: true,
    message: "Create category successfully",
    data: response,
  });
});

app.patch("/:id", async (c: Context) => {
  const id = Number(c.req.param("id"));
  const request = (await c.req.json()) as UpdateCategoryRequest;
  request.id = id;

  const response = await CategoryService.update(request);

  return c.json({
    success: true,
    message: "Update category successfully",
    data: response,
  });
});

app.delete("/:id", async (c: Context) => {
  const id = Number(c.req.param("id"));
  const response = await CategoryService.delete(id);

  return c.json({
    success: true,
    message: "Delete category successfully",
    data: response,
  });
});

export default app;
