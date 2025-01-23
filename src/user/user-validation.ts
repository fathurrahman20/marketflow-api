import { z, ZodType } from "zod";

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string().min(3).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(3).max(100).optional(),
    password: z.string().min(6).max(100).optional(),
    address: z.string().min(10).max(200).optional(),
    imageId: z.string().optional(),
    imageUrl: z.string().optional(),
  });
}
