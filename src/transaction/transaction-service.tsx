import { Cart, Status, User } from "@prisma/client";
import {
  CreateTransactionItemRequest,
  CreateTransactionRequest,
} from "./transaction-model";
import { prisma } from "../application/database";
import { HTTPException } from "hono/http-exception";
import { CartValidation } from "./transaction-validation";
import cuid from "cuid";
// @ts-ignore
import snap from "../utils/midtrans";

export class TransactionService {
  static async get(user: User) {
    return await prisma.transaction.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });
  }
  static async create(user: User, request: CreateTransactionRequest) {
    request = CartValidation.CREATE.parse(request);

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new HTTPException(400, { message: "Cart is empty" });
    }

    let totalAmount = 30000;

    for (const item of cart.items) {
      let itemTotalPrice = item.product.price * item.quantity;
      totalAmount += itemTotalPrice;

      if (item.product.stock < item.quantity) {
        throw new HTTPException(400, {
          message: `Product ${item.product.name} is out of stock. Cannot add more items.`,
        });
      }
    }

    const items = cart.items.map((item) => ({
      id: item.product.id,
      price: item.product.price,
      quantity: item.quantity,
      name: item.product.name,
    }));

    const transactionId = cuid();

    let parameter = {
      transaction_details: {
        order_id: transactionId,
        gross_amount: totalAmount,
      },
      item_details: items,
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
      callbacks: {
        finish: `${Bun.env.FE_URL}/history`,
        error: `${Bun.env.FE_URL}/history`,
        pending: `${Bun.env.FE_URL}/history`,
      },
    };

    let transactionToken = "";
    let transactionRedirectUrl = "";
    const response = await snap.createTransaction(parameter);

    console.log("ResPoNSE: ", response);
    console.log("ItEMS: ", parameter);

    if (!response.token) {
      throw new HTTPException(500);
    }

    const transaction = await prisma.transaction.create({
      data: {
        id: transactionId,
        userId: user.id,
        address: request.address,
        city: request.city,
        name: request.name,
        phone: request.phone,
        postalCode: request.postalCode,
        province: request.province,
        totalAmount,
        snap_token: response.token,
        snap_redirect_url: response.redirect_url,
      },
      include: { items: true },
    });

    for (const item of cart.items) {
      await prisma.transactionItem.create({
        data: {
          transactionId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        },
      });

      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: item.product.stock - item.quantity },
      });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return transaction;
  }

  static async updateTransactionStatus(
    transactionId: string,
    status: Status,
    paymentType: string | null = null
  ) {
    return prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
        payment_type: paymentType,
      },
    });
  }
}
