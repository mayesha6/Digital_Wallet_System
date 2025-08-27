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
exports.TransactionServices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const wallet_model_1 = require("../wallet/wallet.model");
const transaction_model_1 = require("./transaction.model");
const user_model_1 = require("../user/user.model");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const createTransaction = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { transactionType, amount, from, to, initiatedBy } = payload;
        if (!amount || amount <= 0) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Amount must be positive");
        }
        const userWallet = yield wallet_model_1.Wallet.findOne({ user: initiatedBy }).session(session);
        if (!userWallet || userWallet.isBlocked) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Initiator's wallet is blocked or not found");
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
                    throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
                }
                userWallet.balance -= amount;
                break;
            case "SEND_MONEY":
                if (!to)
                    throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Receiver required");
                receiverWallet = yield wallet_model_1.Wallet.findOne({ user: to }).session(session);
                if (!receiverWallet || receiverWallet.isBlocked) {
                    throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Receiver wallet not found or blocked");
                }
                fee = Math.floor(amount * 0.01);
                if (userWallet.balance < amount + fee) {
                    throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance including fee");
                }
                userWallet.balance -= amount + fee;
                receiverWallet.balance += amount;
                yield receiverWallet.save({ session });
                break;
            case "CASH_IN":
                if (!to)
                    throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User ID required");
                receiverWallet = yield wallet_model_1.Wallet.findOne({ user: to }).session(session);
                if (!receiverWallet || receiverWallet.isBlocked) {
                    throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Receiver wallet not found or blocked");
                }
                commission = Math.floor(amount * 0.1); // Agent gets 10%
                receiverWallet.balance += amount;
                userWallet.balance += commission;
                yield receiverWallet.save({ session });
                break;
            case "CASH_OUT":
                if (!from)
                    throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User ID required");
                const targetWallet = yield wallet_model_1.Wallet.findOne({ user: from }).session(session);
                if (!targetWallet ||
                    targetWallet.balance < amount ||
                    targetWallet.isBlocked) {
                    throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid target wallet or insufficient funds");
                }
                commission = Math.floor(amount * 0.1); // Agent earns
                targetWallet.balance -= amount;
                userWallet.balance += commission;
                yield targetWallet.save({ session });
                break;
            default:
                throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid transaction type");
        }
        yield userWallet.save({ session });
        const transaction = yield transaction_model_1.Transaction.create([
            Object.assign(Object.assign({}, payload), { fee,
                commission, status: "COMPLETED" }),
        ], { session });
        yield session.commitTransaction();
        return transaction[0];
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
// const getMyTransactions = async (userId: string) => {
//   const user = await User.findById(userId);
//   const transactions = await Transaction.find({
//     $or: [{ from: user }, { to: user }, { initiatedBy: user }],
//   }).sort({ createdAt: -1 });
//   return transactions;
// };
const getMyTransactions = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const transactionData = new QueryBuilder_1.QueryBuilder(transaction_model_1.Transaction.find({
        $or: [{ from: user._id }, { to: user._id }, { initiatedBy: user._id }],
    }), query)
        .filter()
        .sort()
        .paginate();
    const [data, meta] = yield Promise.all([
        transactionData.build(),
        transactionData.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const getAllTransactions = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(transaction_model_1.Transaction.find(), query);
    const transationData = queryBuilder.filter().sort().fields().paginate();
    const [data, meta] = yield Promise.all([
        transationData.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
exports.TransactionServices = {
    createTransaction,
    getAllTransactions,
    getMyTransactions,
};
