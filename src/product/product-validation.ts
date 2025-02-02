import { z, ZodType } from "zod";

export class ProductValidation {
  static readonly GET: ZodType = z.string();

  static readonly CREATE: ZodType = z.object({
    name: z.string().min(5).max(100),
    slug: z.string().min(5).max(100),
    description: z.string().min(5),
    image: z.object({
      id: z.string(),
      url: z.string(),
    }),
    price: z.number().positive(),
    brandId: z.string(),
    categoryId: z.string(),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(5).max(100).optional(),
    slug: z.string().min(5).max(100).optional(),
    description: z.string().min(5).optional(),
    image: z.object({
      id: z.string().optional(),
      url: z.string().optional(),
    }),
    price: z.number().positive().optional(),
    brandId: z.string(),
    categoryId: z.string(),
  });

  static readonly DELETE: ZodType = z.string();
}
