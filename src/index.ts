import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import user from "./user/user-controller";
import brand from "./brand/brand-controller";
import category from "./category/category-controller";
import product from "./product/product-controller";
import cart from "./cart/cart-controller";
import transaction from "./transaction/transaction-controller";
import transactionNotif from "./transaction-notification/transaction-notification-controller";
import wishlist from "./wishlist/wishlist-controller";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { fromError } from "zod-validation-error";
import uiScalar from "./docs";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { AppVariables } from "./middleware/auth-middleware";

const app = new OpenAPIHono();

app.route("/api/transactions-notification", transactionNotif);

app.use(
  "/api/*",
  cors({
    origin: [Bun.env.FE_URL!, Bun.env.BE_URL!],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use(logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get(
  "/reference",
  apiReference({
    theme: "purple",
    spec: {
      url: "/openapi.json",
    },
  })
);

app.doc("/openapi.json", (openapi) => {
  return {
    ...openapi,
    openapi: "3.1.0",
    info: {
      version: "1.0.0",
      title: "Marketflow API",
      description: "API for Marketflow project.",
    },
    components: {
      securitySchemes: {
        authTokenCookie: {
          type: "apiKey",
          in: "cookie",
          name: "auth_token",
        },
        refreshTokenCookie: {
          type: "apiKey",
          in: "cookie",
          name: "refresh_token",
        },
      },
    },
  };
});

app.route("/api", uiScalar);
app.route("/api/products", product);
app.route("/api/brands", brand);
app.route("/api/categories", category);
app.route("/api/carts", cart);
app.route("/api/transactions", transaction);
app.route("/api/wishlists", wishlist);
app.route("/api", user);

// Error Handling
app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({
      success: false,
      message: err.message,
    });
  } else if (err instanceof ZodError) {
    console.log("errorr");
    c.status(400);
    const validationError = fromError(err);
    return c.json({
      success: false,
      message: err,
      // message: validationError.toString(),
    });
  } else {
    c.status(500);
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

export default {
  port: Bun.env.PORT || 3000,
  fetch: app.fetch,
};
