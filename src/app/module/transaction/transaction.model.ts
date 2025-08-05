import { Schema, model } from "mongoose";
import { ITransaction, TransactionType, TransactionStatus } from "./transaction.interface";
import { Role } from "../user/user.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    transactionType: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    fee: {
      type: Number,
      default: 0,
    },
    commissionRate: {
          type: Number,
          default: function () {
            return (this as any).role === Role.AGENT ? 10 : 0;
          },
        },
    from: {
      type: Schema.Types.ObjectId,
      ref: "User", // or "Wallet" depending on your design
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User", // or "Wallet"
    },
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // can be user or agent
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Transaction = model<ITransaction>("Transaction", transactionSchema);
