"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionZodSchema = void 0;
const zod_1 = require("zod");
const transaction_interface_1 = require("./transaction.interface");
exports.createTransactionZodSchema = zod_1.z.object({
    TransactionType: zod_1.z
        .enum(Object.values(transaction_interface_1.TransactionType))
        .optional(),
    amount: zod_1.z
        .number({ message: "Amount is must be number" })
        .positive("Amount must be a positive number"),
    fee: zod_1.z.number().nonnegative().optional(),
    commission: zod_1.z.number().nonnegative().optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
    initiatedBy: zod_1.z.string({ message: "InitiatedBy is required" }),
    status: zod_1.z
        .enum(Object.values(transaction_interface_1.TransactionStatus))
        .optional(),
});
