import { z } from "@hono/zod-openapi";
import { ZodType } from "zod";

export class WishlistValidation {
  static readonly CREATE: ZodType = z.object({
    productId: z
      .string()
      .min(4)
      .openapi({ description: "Product ID", example: "abcdbjdafb" }),
  });
  static readonly DELETE: ZodType = z
    .string()
    .min(4)
    .openapi({ description: "Product ID", example: "abcdbjdafb" });
}
