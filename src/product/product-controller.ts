import { v2 as cloudinary } from "cloudinary";
import { Context, Hono } from "hono";
import { encodeBase64 } from "hono/utils/encode";
import { authMiddleware } from "../middleware/auth-middleware";
import { isAdmin } from "../middleware/is-admin";
import { ProductService } from "./product-service";
import { CreateProductRequest, SearchProductRequest } from "./prodect-model";

const app = new Hono();

// get all product
app.get("/", async (c: Context) => {
  const request: SearchProductRequest = {
    category: c.req.query("category")?.split(","),
    brand: c.req.query("brand")?.split(","),
    page: Number(c.req.query("page")),
  };
  const response = await ProductService.get(request);

  return c.json({
    success: true,
    message: "Get products successfully",
    data: response,
  });
});

// get product by id
app.get("/:id", async (c: Context) => {
  const id = c.req.param("id");

  const response = await ProductService.getProduct(id);

  return c.json({
    success: true,
    message: "Get product successfully",
    data: response,
  });
});

app.use(authMiddleware);

app.use(isAdmin);

app.use(async (_, next) => {
  cloudinary.config({
    secure: true,
    cloud_name: Bun.env.CLOUD_NAME,
    api_key: Bun.env.CLOUD_API_KEY,
    api_secret: Bun.env.CLOUD_API_SECRET,
  });
  await next();
});

app.post("/", async (c: Context) => {
  const response = await ProductService.create(c);

  return c.json(
    {
      success: true,
      message: "Create product successfully",
      data: response,
    },
    201
  );
});

app.patch("/:id", async (c: Context) => {
  const response = await ProductService.update(c);

  return c.json({
    success: true,
    message: "Update successfully",
    data: response,
  });
});

app.delete("/:id", async (c: Context) => {
  const id = c.req.param("id");

  const response = await ProductService.deleteProduct(id);

  return c.json({
    success: true,
    message: "Deleted product successfully",
    data: response,
  });
});

app.delete("/", async (c: Context) => {
  const response = await ProductService.deleteProducts();

  return c.json({
    success: true,
    message: "Delete products successfully",
    data: response,
  });
});

export default app;
