import { Context, Hono } from "hono";
import { BrandService } from "./brand-service";
import { CreateBrandRequest, UpdateBrandRequest } from "./brand-model";
import { authMiddleware } from "../middleware/auth-middleware";
import { isAdmin } from "../middleware/is-admin";

const app = new Hono();

app.get("/", async (c: Context) => {
  const response = await BrandService.get();
  return c.json({
    success: true,
    message: "Successfully get brands",
    data: response,
  });
});

app.get("/:id", async (c: Context) => {
  const request = c.req.param("id");
  const response = await BrandService.getById(request);

  return c.json({
    success: true,
    message: "Successfully get brand detail",
    data: response,
  });
});

app.use(authMiddleware);

app.use(isAdmin);

app.post("/", async (c: Context) => {
  const request = (await c.req.json()) as CreateBrandRequest;
  const response = await BrandService.create(request);

  return c.json({
    success: true,
    message: "Create brand successfully",
    data: response,
  });
});

app.patch("/:id", async (c: Context) => {
  const id = c.req.param("id");
  const request = (await c.req.json()) as UpdateBrandRequest;
  request.id = id;

  const response = await BrandService.update(request);

  return c.json({
    success: true,
    message: "Update brand successfully",
    data: response,
  });
});

app.delete("/:id", async (c: Context) => {
  const id = c.req.param("id");
  const response = await BrandService.delete(id);

  return c.json({
    success: true,
    message: "Delete brand successfully",
    data: response,
  });
});

export default app;
