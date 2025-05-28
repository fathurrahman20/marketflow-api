import { z } from "@hono/zod-openapi";

export class CartValidation {
  static readonly CREATE = z.object({
    name: z
      .string()
      .min(2)
      .openapi({ description: "Receipent's name", example: "John Doe" }),
    address: z
      .string()
      .min(10)
      .max(30)
      .openapi({ description: "Address", example: "xxxxxxxxxx" }),
    city: z
      .string()
      .min(3)
      .max(30)
      .openapi({ description: "City", example: "Bekasi" }),
    province: z
      .string()
      .min(3)
      .max(30)
      .openapi({ description: "Province", example: "Jawa Barat" }),
    postalCode: z
      .string()
      .min(5)
      .max(5)
      .openapi({ description: "Postal Code", example: "12345" }),
    phone: z
      .string()
      .min(11)
      .max(14)
      .openapi({ description: "Phone Number", example: "0812345678901" }),
  });
}
