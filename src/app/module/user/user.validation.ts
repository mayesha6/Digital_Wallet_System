import z from "zod";
import { Role, UserStatus } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({ message: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  password: z
    .string({ message: "Password must be string" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),
  phone: z
    .string({ message: "Phone Number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  address: z
    .string({ message: "Address must be string" })
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),
  role: z
    .enum([Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT, Role.USER])
    .optional(),

  isVerified: z
    .boolean({ message: "isVerified must be true or false" })
    .optional(),
  userStatus: z.enum(Object.values(UserStatus) as [string]).optional(),
});
export const updateUserZodSchema = z
  .object({
    name: z
      .string({ message: "Name must be string" })
      .min(2, { message: "Name must be at least 2 characters long." })
      .max(50, { message: "Name cannot exceed 50 characters." })
      .optional(),
    role: z
      .enum([Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT, Role.USER])
      .optional(),
    userStatus: z.enum(Object.values(UserStatus) as [string]).optional(),
    isVerified: z
      .boolean({ message: "isVerified must be true or false" })
      .optional(),
    address: z
      .string({ message: "Address must be string" })
      .max(200, { message: "Address cannot exceed 200 characters." })
      .optional(),
  })
  .strict();
