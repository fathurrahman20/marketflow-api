import { Context } from "hono";
import { Hono } from "hono";
import { TransactionNotificationService } from "./transaction-notification-service";
import { authMiddleware } from "../middleware/auth-middleware";
import {
  CreateTransactionRequest,
  TransactionType,
} from "./transaction-notification-model";

const app = new Hono();

app.use(authMiddleware);

app.post("/", async (c: Context) => {
  const request = (await c.req.json()) as TransactionType;

  // const response = await TransactionService.create(user, request);
  TransactionNotificationService.getTransactionById(request.id).then(
    (transaction: any) => {
      if (transaction) {
        TransactionNotificationService.updateStatusBasedOnMidtransResponse(
          transaction.id,
          request
        ).then((result) => {
          console.log(`Result: ${result}`);
        });
      }
    }
  );

  return c.json(
    {
      status: "success",
      message: "OK",
    },
    200
  );
});

export default app;
