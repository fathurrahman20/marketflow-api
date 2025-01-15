import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import user from "./user/user-controller";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { fromError } from "zod-validation-error";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api/users", user);

// Error Handling
app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({
      errors: err.message,
    });
  } else if (err instanceof ZodError) {
    c.status(400);
    const validationError = fromError(err);
    return c.json({
      errors: validationError.toString(),
    });
  } else {
    c.status(500);
    return c.json({
      errors: err.message,
    });
  }
});

export default app;
