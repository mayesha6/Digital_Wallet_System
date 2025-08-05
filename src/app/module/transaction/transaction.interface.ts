import { Types } from "mongoose";

export enum TransactionType {
  ADD_MONEY = "ADD_MONEY",
  WITHDRAW = "WITHDRAW",
  SEND_MONEY = "SEND_MONEY",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
}
export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  REVERSED = "REVERSED",
}
export interface ITransaction {
  _id?: Types.ObjectId;
  transactionType: TransactionType;
  amount: number;
  fee?: number;
  commissionRate?: number;
  from?: Types.ObjectId;
  to?: Types.ObjectId; 
  initiatedBy: Types.ObjectId; 
  status: TransactionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
