import AppError from "../../errorHelpers/AppError";
import {
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { Role, UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { Wallet } from "./wallet.model";
import httpStatus from "http-status-codes";

const createWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found with this id.");
  }
  return wallet;
};

const getWalletByUserId = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found with this id.");
  }
  return wallet;
};

const blockWallet = async (walletId: string) => {
  const wallet = await Wallet.findByIdAndUpdate(
    walletId,
    { isBlocked: true },
    { new: true }
  );
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found with this id.");
  }
  return wallet;
};

const unblockWallet = async (walletId: string) => {
  const wallet = await Wallet.findByIdAndUpdate(
    walletId,
    { isBlocked: false },
    { new: true }
  );
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found with this id");
  }
  return wallet;
};

const addMoney = async (userId: string, amount: number) => {
  if (isNaN(amount) || amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Amount must be a positive number"
    );
  }

  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, "Your wallet is blocked");
  }
  wallet.balance += amount;
  await wallet.save();

  await Transaction.create({
    transactionType: TransactionType.ADD_MONEY,
    amount,
    fee: 0,
    from: null,
    to: wallet.user,
    initiatedBy: userId,
    status: TransactionStatus.COMPLETED,
  });

  return wallet;
};

const sendMoney = async (
  senderId: string,
  receiverPhone: string,
  amount: number
) => {
  if (isNaN(amount) || amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Amount must be a positive number"
    );
  }

  const senderWallet = await Wallet.findOne({ user: senderId });
  if (!senderWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Sender's wallet not found");
  }
  if (senderWallet.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, "Your wallet is blocked");
  }
  const receiver = await User.findOne({ phone: receiverPhone });
  if (!receiver) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");
  }
  if (receiver.role === Role.AGENT) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "You can not send money to agent."
    );
  }

  const receiverWallet = await Wallet.findOne({ user: receiver._id });
  if (!receiverWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver's wallet not found");
  }

  const fee = amount < 500 ? 0 : 5;
  const totalAmount = amount + fee;

  if (senderWallet.balance < totalAmount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  senderWallet.balance -= totalAmount;
  receiverWallet.balance += amount;

  await senderWallet.save();
  await receiverWallet.save();

  await Transaction.create({
    transactionType: TransactionType.SEND_MONEY,
    amount,
    fee,
    from: senderWallet.user,
    to: receiverWallet.user,
    initiatedBy: senderId,
    status: TransactionStatus.COMPLETED,
  });

  return {
    senderWallet,
    receiverWallet,
  };
};

const withdraw = async (userId: string, withdrawAmount: number) => {
  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Withdraw amount must be a positive number"
    );
  }

  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }
  if (wallet.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, "Your wallet is blocked");
  }

  const fee = withdrawAmount * 0.01;
  const totlaWithdrawAmount = withdrawAmount + fee;

  if (wallet.balance < totlaWithdrawAmount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  wallet.balance -= totlaWithdrawAmount;
  await wallet.save();

  await Transaction.create({
    transactionType: TransactionType.WITHDRAW,
    amount: withdrawAmount,
    fee: fee,
    from: wallet.user,
    to: null,
    initiatedBy: userId,
    status: TransactionStatus.COMPLETED,
  });

  return wallet;
};

const cashIn = async (agentId: string, userPhone: string, amount: number) => {
  if (isNaN(amount) || amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Amount must be a positive number"
    );
  }

  const agent = await User.findById(agentId);
  if (
    !agent ||
    agent.role !== Role.AGENT ||
    agent.userStatus !== UserStatus.APPROVED
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "Agent not approved for cash in");
  }

  const agentWallet = await Wallet.findOne({ user: agent._id });
  if (!agentWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
  }

  if (agentWallet.balance < amount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Agent has insufficient balance"
    );
  }

  const user = await User.findOne({ phone: userPhone });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const userWallet = await Wallet.findOne({ user: user._id });
  if (!userWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
  }
  if (userWallet.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, "Your wallet is blocked");
  }
  agentWallet.balance -= amount;
  userWallet.balance += amount;
  await agentWallet.save();
  await userWallet.save();

  await Transaction.create({
    transactionType: TransactionType.CASH_IN,
    amount,
    fee: 0,
    from: agent._id,
    to: user._id,
    initiatedBy: agentId,
    status: TransactionStatus.COMPLETED,
  });

  return {
    userWallet,
    agentWallet,
  };
};

const cashOut = async (userId: string, agentPhone: string, amount: number) => {
  if (isNaN(amount) || amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Amount must be a positive number"
    );
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const userWallet = await Wallet.findOne({ user: user._id });
  if (!userWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
  }
  if (userWallet.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, "Your wallet is blocked");
  }
  const agent = await User.findOne({ phone: agentPhone, role: Role.AGENT });
  if (!agent || agent.userStatus !== UserStatus.APPROVED) {
    throw new AppError(httpStatus.FORBIDDEN, "Agent not approved for cash out");
  }

  const agentWallet = await Wallet.findOne({ user: agent._id });
  if (!agentWallet)
    throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found.");

  const fee = amount * 0.02;
  const totalCashOutAmount = amount + fee;
  const commission = ((agent.commissionRate as number) / 100) * fee;
  console.log("agent.commissionRate:", agent.commissionRate);
  console.log("fee: ", fee);
  console.log("commission: ", commission);

  if (userWallet.balance < totalCashOutAmount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance.");
  }

  userWallet.balance -= totalCashOutAmount;
  agentWallet.balance += commission + amount;

  await userWallet.save();
  await agentWallet.save();

  await Transaction.create({
    transactionType: TransactionType.CASH_OUT,
    amount,
    fee,
    from: user._id,
    to: agent._id,
    initiatedBy: user._id,
    status: TransactionStatus.COMPLETED,
  });

  return {
    message: `Cash out successful. Agent earned commission: ${commission}`,
    userWallet,
    agentWallet,
    earnedCommission: commission,
  };
};

export const WalletServices = {
  createWallet,
  getWalletByUserId,
  blockWallet,
  unblockWallet,
  addMoney,
  sendMoney,
  withdraw,
  cashIn,
  cashOut,
};
