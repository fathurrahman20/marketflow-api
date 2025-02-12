import { User } from "@prisma/client";
import { prisma } from "../application/database";
import { CreateWishlistRequest } from "./wishlist-model";
import { WishlistValidation } from "./wishlist-validation";
import { HTTPException } from "hono/http-exception";

export class WishlistService {
  static async get(user: User) {
    return await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: { product: true },
    });
  }

  static async create(user: User, request: CreateWishlistRequest) {
    request = WishlistValidation.CREATE.parse(request);

    const findWishlist = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId: user.id, productId: request.productId },
      },
    });

    if (findWishlist) {
      throw new HTTPException(400, { message: "Product already on wishlist" });
    }

    const wishlist = await prisma.wishlist.create({
      data: { userId: user.id, productId: request.productId },
      include: { product: true },
    });
    return wishlist;
  }

  static async delete(id: string) {
    id = WishlistValidation.DELETE.parse(id);

    const findWishlist = await prisma.wishlist.findUnique({
      where: { id },
    });

    if (!findWishlist) {
      throw new HTTPException(404, {
        message: "Wishlist item not found. It may have been removed.",
      });
    }

    await prisma.wishlist.delete({
      where: { id },
    });

    return true;
  }
}
