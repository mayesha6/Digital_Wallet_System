"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletServices = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const transaction_interface_1 = require("../transaction/transaction.interface");
const transaction_model_1 = require("../transaction/transaction.model");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("./wallet.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createWallet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found with this id.");
    }
    return wallet;
});
const getWalletByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found with this id.");
    }
    return wallet;
});
const blockWallet = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findByIdAndUpdate(walletId, { isBlocked: true }, { new: true });
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found with this id.");
    }
    return wallet;
});
const unblockWallet = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findByIdAndUpdate(walletId, { isBlocked: false }, { new: true });
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found with this id");
    }
    return wallet;
});
const addMoney = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(amount) || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Amount must be a positive number");
    }
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    if (wallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your wallet is blocked");
    }
    wallet.balance += amount;
    yield wallet.save();
    yield transaction_model_1.Transaction.create({
        transactionType: transaction_interface_1.TransactionType.ADD_MONEY,
        amount,
        fee: 0,
        from: null,
        to: wallet.user,
        initiatedBy: userId,
        status: transaction_interface_1.TransactionStatus.COMPLETED,
    });
    return wallet;
});
const sendMoney = (senderId, receiverPhone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(amount) || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Amount must be a positive number");
    }
    const senderWallet = yield wallet_model_1.Wallet.findOne({ user: senderId });
    if (!senderWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Sender's wallet not found");
    }
    if (senderWallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your wallet is blocked");
    }
    const receiver = yield user_model_1.User.findOne({ phone: receiverPhone });
    if (!receiver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Receiver not found");
    }
    if (receiver.role === user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "You can not send money to agent.");
    }
    const receiverWallet = yield wallet_model_1.Wallet.findOne({ user: receiver._id });
    if (!receiverWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Receiver's wallet not found");
    }
    const fee = amount < 500 ? 0 : 5;
    const totalAmount = amount + fee;
    if (senderWallet.balance < totalAmount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
    }
    senderWallet.balance -= totalAmount;
    receiverWallet.balance += amount;
    yield senderWallet.save();
    yield receiverWallet.save();
    yield transaction_model_1.Transaction.create({
        transactionType: transaction_interface_1.TransactionType.SEND_MONEY,
        amount,
        fee,
        from: senderWallet.user,
        to: receiverWallet.user,
        initiatedBy: senderId,
        status: transaction_interface_1.TransactionStatus.COMPLETED,
    });
    return {
        senderWallet,
        receiverWallet,
    };
});
const withdraw = (userId, withdrawAmount) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Withdraw amount must be a positive number");
    }
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    if (wallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your wallet is blocked");
    }
    const fee = withdrawAmount * 0.01;
    const totlaWithdrawAmount = withdrawAmount + fee;
    if (wallet.balance < totlaWithdrawAmount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
    }
    wallet.balance -= totlaWithdrawAmount;
    yield wallet.save();
    yield transaction_model_1.Transaction.create({
        transactionType: transaction_interface_1.TransactionType.WITHDRAW,
        amount: withdrawAmount,
        fee: fee,
        from: wallet.user,
        to: null,
        initiatedBy: userId,
        status: transaction_interface_1.TransactionStatus.COMPLETED,
    });
    return wallet;
});
const cashIn = (agentId, userPhone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(amount) || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Amount must be a positive number");
    }
    const agent = yield user_model_1.User.findById(agentId);
    if (!agent ||
        agent.role !== user_interface_1.Role.AGENT ||
        agent.userStatus !== user_interface_1.UserStatus.APPROVED) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent not approved for cash in");
    }
    const agentWallet = yield wallet_model_1.Wallet.findOne({ user: agent._id });
    if (!agentWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found");
    }
    if (agentWallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent has insufficient balance");
    }
    const user = yield user_model_1.User.findOne({ phone: userPhone });
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    const userWallet = yield wallet_model_1.Wallet.findOne({ user: user._id });
    if (!userWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
    }
    if (userWallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your wallet is blocked");
    }
    agentWallet.balance -= amount;
    userWallet.balance += amount;
    yield agentWallet.save();
    yield userWallet.save();
    yield transaction_model_1.Transaction.create({
        transactionType: transaction_interface_1.TransactionType.CASH_IN,
        amount,
        fee: 0,
        from: agent._id,
        to: user._id,
        initiatedBy: agentId,
        status: transaction_interface_1.TransactionStatus.COMPLETED,
    });
    return {
        userWallet,
        agentWallet,
    };
});
const cashOut = (userId, agentPhone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(amount) || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Amount must be a positive number");
    }
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    const userWallet = yield wallet_model_1.Wallet.findOne({ user: user._id });
    if (!userWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
    }
    if (userWallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your wallet is blocked");
    }
    const agent = yield user_model_1.User.findOne({ phone: agentPhone, role: user_interface_1.Role.AGENT });
    if (!agent || agent.userStatus !== user_interface_1.UserStatus.APPROVED) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent not approved for cash out");
    }
    const agentWallet = yield wallet_model_1.Wallet.findOne({ user: agent._id });
    if (!agentWallet)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found.");
    const fee = amount * 0.02;
    const totalCashOutAmount = amount + fee;
    const commission = (agent.commissionRate / 100) * fee;
    console.log("agent.commissionRate:", agent.commissionRate);
    console.log("fee: ", fee);
    console.log("commission: ", commission);
    if (userWallet.balance < totalCashOutAmount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance.");
    }
    userWallet.balance -= totalCashOutAmount;
    agentWallet.balance += commission + amount;
    yield userWallet.save();
    yield agentWallet.save();
    yield transaction_model_1.Transaction.create({
        transactionType: transaction_interface_1.TransactionType.CASH_OUT,
        amount,
        fee,
        from: user._id,
        to: agent._id,
        initiatedBy: user._id,
        status: transaction_interface_1.TransactionStatus.COMPLETED,
    });
    return {
        message: `Cash out successful. Agent earned commission: ${commission}`,
        userWallet,
        agentWallet,
        earnedCommission: commission,
    };
});
exports.WalletServices = {
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
