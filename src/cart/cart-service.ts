import { User } from "@prisma/client";
import { prisma } from "../application/database";
import { CreateCartItemRequest } from "./cart-model";
import { HTTPException } from "hono/http-exception";

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
      include: { product: true },
    });

    const product = await prisma.product.findUnique({
      where: { id: request.productId },
    });

    if (existingCartItem) {
      if (request.quantity === 0) {
        throw new HTTPException(400, {
          message: "Product quantity cannot be zero.",
        });
      }

      if (existingCartItem.quantity === product?.stock) {
        throw new HTTPException(400, {
          message: "Product is out of stock. Cannot add more items.",
        });
      }

      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem?.quantity + request.quantity,
          totalPrice:
            existingCartItem.product.price *
            Number(existingCartItem?.quantity + request.quantity),
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: request.productId,
          quantity: request.quantity,
          totalPrice: product?.price,
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
