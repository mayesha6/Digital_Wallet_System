"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }),
    password: zod_1.default
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
    phone: zod_1.default
        .string({ message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
    address: zod_1.default
        .string({ message: "Address must be string" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(),
    role: zod_1.default
        .enum([user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.ADMIN, user_interface_1.Role.AGENT, user_interface_1.Role.USER])
        .optional(),
    isVerified: zod_1.default
        .boolean({ message: "isVerified must be true or false" })
        .optional(),
    userStatus: zod_1.default.enum(Object.values(user_interface_1.UserStatus)).optional(),
});
exports.updateUserZodSchema = zod_1.default
    .object({
    name: zod_1.default
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." })
        .optional(),
    role: zod_1.default
        .enum([user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.ADMIN, user_interface_1.Role.AGENT, user_interface_1.Role.USER])
        .optional(),
    userStatus: zod_1.default.enum(Object.values(user_interface_1.UserStatus)).optional(),
    isVerified: zod_1.default
        .boolean({ message: "isVerified must be true or false" })
        .optional(),
    address: zod_1.default
        .string({ message: "Address must be string" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(),
})
    .strict();
