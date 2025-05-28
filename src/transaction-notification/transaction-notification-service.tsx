import { Cart, User } from "@prisma/client";
import {
  CreateTransactionItemRequest,
  CreateTransactionRequest,
  TPaymentNotification,
} from "./transaction-notification-model";
import { prisma } from "../application/database";
import { HTTPException } from "hono/http-exception";
import { CartValidation } from "./transaction-notification-validation";
import cuid from "cuid";
// @ts-ignore
import snap from "../utils/midtrans";
import crypto from "crypto";
import { TransactionService } from "../transaction/transaction-service";

export class TransactionNotificationService {
  static async getTransactionById(id: string) {
    return prisma.transaction.findMany({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  }
  static async updateStatusBasedOnMidtransResponse(
    transaction_id: string,
    data: TPaymentNotification
  ) {
    const hash = crypto
      .createHash("sha512")
      .update(
        `${transaction_id}${data.status_code}${data.gross_amount}${Bun.env.MIDTRANS_SERVER_KEY}`
      )
      .digest("hex");
    if (data.signature_key !== hash) {
      return {
        status: "error",
        message: "Invalid Signature key",
      };
    }

    let responseData = null;
    let transactionStatus = data.transaction_status;
    let fraudStatus = data.fraud_status;

    if (transactionStatus == "capture") {
      if (fraudStatus == "accept") {
        const transaction = await TransactionService.updateTransactionStatus(
          transaction_id,
          "Paid",
          data.payment_type
        );
        responseData = transaction;
      }
    } else if (transactionStatus == "settlement") {
      const transaction = await TransactionService.updateTransactionStatus(
        transaction_id,
        "Paid",
        data.payment_type
      );
      responseData = transaction;
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      const transaction = await TransactionService.updateTransactionStatus(
        transaction_id,
        "Cancelled"
      );
      responseData = transaction;
    } else if (transactionStatus == "pending") {
      const transaction = await TransactionService.updateTransactionStatus(
        transaction_id,
        "Pending"
      );
      responseData = transaction;
    }

    return {
      status: "success",
      data: responseData,
    };
  }
}
