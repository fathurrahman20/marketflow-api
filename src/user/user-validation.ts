// import { z, ZodType } from "zod";
import { z } from "@hono/zod-openapi";
export class UserValidation {
  static readonly REGISTER = z.object({
    name: z
      .string()
      .min(3)
      .max(100)
      .openapi({ description: "Full name of the user", example: "John Doe" }),
    email: z
      .string()
      .email()
      .openapi({
        description: "User's email address",
        example: "johndoe@example.com",
      }),
    password: z
      .string()
      .min(6)
      .max(100)
      .openapi({
        description: "Password for the user account",
        example: "password123",
      }),
  });

  static readonly LOGIN = z.object({
    email: z
      .string()
      .email()
      .openapi({
        description: "User's email address used for login",
        example: "johndoe@example.com",
      }),
    password: z
      .string()
      .min(6)
      .max(100)
      .openapi({
        description: "Password associated with the user's account",
        example: "password123",
      }),
  });

  static readonly UPDATE = z.object({
    name: z
      .string()
      .min(3)
      .max(100)
      .optional()
      .openapi({
        description: "Updated full name of the user (optional)",
        example: "Jane Doe",
      }),
    password: z
      .string()
      .min(6)
      .max(100)
      .optional()
      .openapi({
        description: "Updated password for the user account (optional)",
        example: "newpassword123",
      }),
    address: z
      .string()
      .min(10)
      .max(200)
      .optional()
      .openapi({
        description: "Updated address of the user (optional)",
        example: "123 Main Street, Springfield, IL",
      }),
    imageId: z
      .string()
      .optional()
      .openapi({
        description: "ID of the user's profile image (optional)",
        example: "img_123456",
      }),
    imageUrl: z
      .string()
      .optional()
      .openapi({
        description: "URL of the user's profile image (optional)",
        example: "https://example.com/image.jpg",
      }),
  });
}
