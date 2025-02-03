import { z } from "@hono/zod-openapi";

export class CartValidation {
  static readonly CREATE = z.object({
    // cartId: z.string().openapi({ description: "Cart ID", example: "abcdbjdafb" }),
    productId: z
      .string()
      .openapi({ description: "Product ID", example: "abcdbjdafb" }),
    quantity: z
      .number()
      .positive()
      .openapi({ description: "Quantity", example: 1 }),
  });
}
