import mongoose from "mongoose";
import { ITransaction } from "./transaction.interface";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "./transaction.model";
import { User } from "../user/user.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { transactionSearchableFields } from "./transaction.constant";
const createTransaction = async (payload: ITransaction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { transactionType, amount, from, to, initiatedBy } = payload;

    if (!amount || amount <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Amount must be positive");
    }

    const userWallet = await Wallet.findOne({ user: initiatedBy }).session(
      session
    );
    if (!userWallet || userWallet.isBlocked) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Initiator's wallet is blocked or not found"
      );
    }

    let receiverWallet;
    let commission = 0;
    let fee = 0;

    switch (transactionType) {
      case "ADD_MONEY":
        userWallet.balance += amount;
        break;

      case "WITHDRAW":
        if (userWallet.balance < amount) {
          throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
        }
        userWallet.balance -= amount;
        break;

      case "SEND_MONEY":
        if (!to)
          throw new AppError(httpStatus.BAD_REQUEST, "Receiver required");
        receiverWallet = await Wallet.findOne({ user: to }).session(session);
        if (!receiverWallet || receiverWallet.isBlocked) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            "Receiver wallet not found or blocked"
          );
        }

        fee = Math.floor(amount * 0.01); 
        if (userWallet.balance < amount + fee) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Insufficient balance including fee"
          );
        }

        userWallet.balance -= amount + fee;
        receiverWallet.balance += amount;
        await receiverWallet.save({ session });
        break;

      case "CASH_IN":
        if (!to) throw new AppError(httpStatus.BAD_REQUEST, "User ID required");
        receiverWallet = await Wallet.findOne({ user: to }).session(session);
        if (!receiverWallet || receiverWallet.isBlocked) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            "Receiver wallet not found or blocked"
          );
        }

        commission = Math.floor(amount * 0.1); // Agent gets 10%
        receiverWallet.balance += amount;
        userWallet.balance += commission;
        await receiverWallet.save({ session });
        break;

      case "CASH_OUT":
        if (!from)
          throw new AppError(httpStatus.BAD_REQUEST, "User ID required");
        const targetWallet = await Wallet.findOne({ user: from }).session(
          session
        );
        if (
          !targetWallet ||
          targetWallet.balance < amount ||
          targetWallet.isBlocked
        ) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Invalid target wallet or insufficient funds"
          );
        }

        commission = Math.floor(amount * 0.1); // Agent earns
        targetWallet.balance -= amount;
        userWallet.balance += commission;
        await targetWallet.save({ session });
        break;

      default:
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid transaction type");
    }

    await userWallet.save({ session });

    const transaction = await Transaction.create(
      [
        {
          ...payload,
          fee,
          commission,
          status: "COMPLETED",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return transaction[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
const getMyTransactions = async (userId: string) => {
  const user = await User.findById(userId);
  const transactions = await Transaction.find({
    $or: [{ from: user }, { to: user }, { initiatedBy: user }],
  }).sort({ createdAt: -1 });

  return transactions;
};
const getAllTransactions = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Transaction.find(), query);
  const transationData = queryBuilder
    .filter()
    .search(transactionSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    transationData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};
export const TransactionServices = {
  createTransaction,
  getAllTransactions,
  getMyTransactions,
};
