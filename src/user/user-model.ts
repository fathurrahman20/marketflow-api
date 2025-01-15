import { User } from "@prisma/client";

export type RegisterUserRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginUserRequest = {
  email: string;
  password: string;
};

export type UpdateUserRequest = {
  name?: string;
  password?: string;
};

export function userResponse(user: User) {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
