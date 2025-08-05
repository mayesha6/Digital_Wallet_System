import { z } from "zod";
import { TransactionType, TransactionStatus } from "./transaction.interface";

export const createTransactionZodSchema = z.object({
  TransactionType: z
    .enum(Object.values(TransactionType) as [string])
    .optional(),
  amount: z
    .number({ message: "Amount is must be number" })
    .positive("Amount must be a positive number"),
  fee: z.number().nonnegative().optional(),
  commission: z.number().nonnegative().optional(),
  from: z.string().optional(), 
  to: z.string().optional(), 
  initiatedBy: z.string({ message: "InitiatedBy is required" }),
  status: z
    .enum(Object.values(TransactionStatus) as [string])
    .optional(),
})