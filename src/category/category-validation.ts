import { z, ZodType } from "zod";

export class CategoryValidation {
  static readonly GET: ZodType = z.number().positive();

  static readonly CREATE: ZodType = z.object({
    name: z.string().min(3).max(100),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    name: z.string().min(3).max(100).optional(),
  });

  static readonly DELETE: ZodType = z.number().positive();
}
