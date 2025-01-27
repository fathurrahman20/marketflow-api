import { OpenAPIHono, z } from "@hono/zod-openapi";
import { AppVariables, authMiddleware } from "../middleware/auth-middleware";
import { User } from "@prisma/client";
import { UserValidation } from "../user/user-validation";
import { UserService } from "../user/user-service";

const tags = ["AUTH"];

const auth = new OpenAPIHono<{ Variables: AppVariables }>();

auth.openapi(
  {
    method: "post",
    path: "/auth/login",
    summary: "Login",
    description: "Login user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: UserValidation.LOGIN,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              message: z.string().default("User logged in successfully"),
              data: z.object({
                id: z.number().default(1),
                name: z.string().default("Fathur"),
                email: z.string().default("fathur@mail.com"),
                role: z.string().default("ADMIN"),
                address: z.string().nullable().default(null),
                imageUrl: z.string().nullable().default(null),
              }),
            }),
          },
        },
        description: "Login Success",
      },
      401: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(false),
              message: z.string().default("Unauthorized"),
            }),
          },
        },
        description: "Invalid email or password",
      },
    },
    tags,
  },
  async (c) => {
    const request = c.req.valid("json");
    const response = await UserService.login(c, request);

    return c.json({
      success: true,
      message: "User logged in successfully",
      data: response,
    });
  }
);

auth.openapi(
  {
    method: "get",
    path: "/auth/me",
    summary: "Get current user",
    description: "Get user data",
    middleware: [authMiddleware],
    security: [{ authTokenCookie: [] }, { refreshTokenCookie: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              message: z.string().default("Successfully fetched user data"),
              data: z.object({
                id: z.number().default(1),
                name: z.string().default("Fathur"),
                email: z.string().default("fathur@mail.com"),
                role: z.string().default("ADMIN"),
                tokenOrigin: z.string().default("/api/auth/login"),
                exp: z.number().default(1737771945),
              }),
            }),
          },
        },
        description: "",
      },
      401: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(false),
              message: z.string().default("Unauthorized"),
            }),
          },
        },
        description: "Unauthorized",
      },
    },
    tags,
  },
  async (c) => {
    const user = c.get("user") as User;
    return c.json({
      success: true,
      message: "Successfully fetched user data",
      data: user,
    });
  }
);

auth.openapi(
  {
    method: "delete",
    path: "auth/me",
    summary: "User Logout",
    description: "User Logout",
    middleware: [authMiddleware],
    security: [{ authTokenCookie: [] }, { refreshTokenCookie: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              message: z.string().default("User logged out successfully"),
              data: z.boolean().default(true),
            }),
          },
        },
        description: "",
      },
      401: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(false),
              message: z.string().default("Unauthorized"),
            }),
          },
        },
        description: "Unauthorized",
      },
    },
    tags,
  },
  async (c) => {
    const response = await UserService.logout(c);

    return c.json({
      success: true,
      message: "User logged out succesfully",
      data: response,
    });
  }
);

auth.openapi(
  {
    method: "get",
    path: "/users",
    summary: "Users",
    description: "Get all user",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              message: z.string().default("Successfully fetched user data"),
              data: z.array(
                z.object({
                  id: z.number().default(1),
                  name: z.string().default("Fathur"),
                  email: z.string().default("fathur@mail.com"),
                  role: z.string().default("ADMIN"),
                })
              ),
            }),
          },
        },
        description: "",
      },
    },
    tags,
  },
  async (c) => {
    const response = await UserService.getUsers();

    return c.json(
      {
        success: true,
        message: "Successfully fetched list of users",
        data: response,
      },
      200
    );
  }
);

auth.openapi(
  {
    method: "get",
    path: "/users/{id}",
    summary: "user",
    description: "Get user",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "User ID",
        required: true,
        type: "number",
      },
    ],
    responses: {
      200: {
        // content: {
        //   "application/json": {
        //     schema: z.object({
        //       success: z.boolean().default(true),
        //       message: z.string().default("Successfully fetched list of users"),
        //       data: z.object({
        //         id: z.number().default(1),
        //         name: z.string().default("Fathur"),
        //         email: z.string().email().default("fathur@mail.com"),
        //         // password: z.string().default(""),
        //         role: z.string().default("ADMIN"),
        //         address: z.string().nullable().default(null),
        //         imageId: z.string().nullable().default(null),
        //         imageUrl: z.string().nullable().default(null),
        //         createdAt: z.date(),
        //         updatedAt: z.date(),
        //       }),
        //     }),
        //   },
        // },
        description: "Success get user",
      },
    },
    tags,
  },
  async (c) => {
    const id = Number(c.req.param("id"));
    const response = await UserService.getUser(id);

    return c.json(
      {
        success: true,
        message: "Successfully fetched list of users",
        data: response,
      },
      200
    );
  }
);

// auth.openapi(
//   {
//     method: "post",
//     path: "/auth/register",
//     summary: "Register",
//     description: "Register User",
//     request: {
//       body: {
//         content: {
//           ""
//         }
//       }
//     }
//   }
// )

export default auth;
