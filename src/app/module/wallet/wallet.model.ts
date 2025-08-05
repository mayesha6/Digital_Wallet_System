import { Schema, model } from "mongoose";
import { IWallet } from "./wallet.interface";
import { Role } from "../user/user.interface";

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
