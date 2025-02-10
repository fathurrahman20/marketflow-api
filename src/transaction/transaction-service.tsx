import { User } from "@prisma/client";
import {
  CreateTransactionItemRequest,
  CreateTransactionRequest,
} from "./transaction-model";
import { prisma } from "../application/database";
import { HTTPException } from "hono/http-exception";
import { CartValidation } from "./transaction-validation";

export class TransactionService {
  static async get(user: User) {
    return await prisma.transaction.findMany({
      where: { userId: user.id },
      include: { items: true },
    });
  }
  static async create(user: User, request: CreateTransactionRequest) {
    request = CartValidation.CREATE.parse(request);
    let transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        address: request.address,
        city: request.city,
        name: request.name,
        phone: request.phone,
        postalCode: request.postalCode,
        province: request.province,
        totalAmount: 0,
      },
    });

    let totalAmount = 30000;

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new HTTPException(400, { message: "Cart is empty" });
    }

    for (const item of cart.items) {
      let itemTotalPrice = item.product.price * item.quantity;
      totalAmount += itemTotalPrice;

      await prisma.transactionItem.create({
        data: {
          transactionId: transaction.id,
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

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { totalAmount },
      include: { items: true },
    });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return updatedTransaction;
  }
}
