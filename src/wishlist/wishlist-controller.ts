import { Context, Hono } from "hono";
import { authMiddleware } from "../middleware/auth-middleware";
import { WishlistService } from "./wishlist-service";
import { CreateWishlistRequest } from "./wishlist-model";

const app = new Hono();

app.use(authMiddleware);

app.get("/", async (c: Context) => {
  const user = c.get("user");
  const response = await WishlistService.get(user);
  return c.json({
    success: true,
    message: "Successfully get wishlists",
    data: response,
  });
});

app.post("/", async (c: Context) => {
  const user = c.get("user");
  const request = (await c.req.json()) as CreateWishlistRequest;

  const response = await WishlistService.create(user, request);

  return c.json({
    succes: true,
    message: "Success add product to wishlist",
    data: response,
  });
});

app.delete("/:id", async (c: Context) => {
  const request = c.req.param("id");

  const response = await WishlistService.delete(request);

  return c.json({
    succes: true,
    message: "Success delete product from wishlist",
    data: response,
  });
});

export default app;
