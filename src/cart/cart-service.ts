import { User } from "@prisma/client";
import { prisma } from "../application/database";
import { CreateCartItemRequest } from "./cart-model";

export class CartService {
  static async get(user: User) {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });
    return cart;
  }

  static async create(user: User, request: CreateCartItemRequest) {
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: request.productId },
    });

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem?.quantity + request.quantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: request.productId,
          quantity: request.quantity,
        },
      });
    }

    return await this.get(user);
  }

  static async delete(user: User, id: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    await prisma.cartItem.delete({
      where: { id },
    });

    return true;
  }
}
