import { Context } from "hono";
import { Hono } from "hono";
import { TransactionService } from "./transaction-service";
import { authMiddleware } from "../middleware/auth-middleware";
import { CreateTransactionRequest } from "./transaction-model";

const app = new Hono();

app.use(authMiddleware);

app.get("/", async (c: Context) => {
  const user = c.get("user");

  const response = await TransactionService.get(user);

  return c.json({
    success: true,
    message: "Get all transaction",
    data: response,
  });
});

app.post("/", async (c: Context) => {
  const request = (await c.req.json()) as CreateTransactionRequest;
  const user = c.get("user");

  const response = await TransactionService.create(user, request);

  return c.json({
    success: true,
    message: "Success create transaction",
    data: response,
  });
});

export default app;
