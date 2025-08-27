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
exports.WalletController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const wallet_service_1 = require("./wallet.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = require("../../utils/sendResponse");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const createWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wallet_service_1.WalletServices.createWallet(req.body);
    res.status(201).json({ success: true, data: result });
}));
const getWalletByUserId = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const result = yield wallet_service_1.WalletServices.getWalletByUserId(userId);
    res.status(200).json({ success: true, data: result });
}));
const blockWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletId = req.params.id;
    const result = yield wallet_service_1.WalletServices.blockWallet(walletId);
    res
        .status(200)
        .json({ success: true, message: "Wallet blocked", data: result });
}));
const unblockWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletId = req.params.id;
    const result = yield wallet_service_1.WalletServices.unblockWallet(walletId);
    res
        .status(200)
        .json({ success: true, message: "Wallet unblocked", data: result });
}));
const addMoney = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const amount = Number(req.body.amount);
    const wallet = yield wallet_service_1.WalletServices.addMoney(decodedToken.userId, amount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Money added to wallet successfully.",
        data: wallet,
    });
}));
const withdraw = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const withdrawAmount = Number(req.body.withdrawAmount);
    const wallet = yield wallet_service_1.WalletServices.withdraw(decodedToken.userId, withdrawAmount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Money withdraw from wallet successfully.",
        data: wallet,
    });
}));
const sendMoney = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const { receiverPhone, amount } = req.body;
    if (!receiverPhone) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Receiver phone number is required");
    }
    const wallet = yield wallet_service_1.WalletServices.sendMoney(decodedToken.userId, receiverPhone, Number(amount));
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Money send from wallet successfully.",
        data: wallet,
    });
}));
const cashIn = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const { phone, amount } = req.body;
    const wallet = yield wallet_service_1.WalletServices.cashIn(decodedToken.userId, phone, Number(amount));
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Cash-in successful",
        data: wallet,
    });
}));
const cashOut = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const { agentPhone, amount } = req.body;
    const wallet = yield wallet_service_1.WalletServices.cashOut(decodedToken.userId, agentPhone, Number(amount));
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Cash-out successful",
        data: wallet,
    });
})); //01742363910 - utsho, 01712363910- maya
exports.WalletController = {
    createWallet,
    getWalletByUserId,
    blockWallet,
    unblockWallet,
    addMoney,
    withdraw,
    sendMoney,
    cashIn,
    cashOut,
};
