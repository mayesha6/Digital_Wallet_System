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
exports.TransactionController = exports.getAllTransactions = exports.getMyTransactions = exports.createTransaction = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const transaction_service_1 = require("./transaction.service");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
exports.createTransaction = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield transaction_service_1.TransactionServices.createTransaction(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Transaction create Successfully",
        data: result,
    });
}));
// export const getMyTransactions = catchAsync(
//   async (req: Request, res: Response, next:NextFunction) => {
//     const myTransaction = req.user as JwtPayload
//     const result = await TransactionServices.getMyTransactions(myTransaction.userId);
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Your Transaction Retrieved Successfully",
//         data: result,
//     })
//   }
// );
exports.getMyTransactions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const myTransaction = req.user;
    const query = req.query;
    const result = yield transaction_service_1.TransactionServices.getMyTransactions(myTransaction.userId, query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Your Transactions Retrieved Successfully",
        data: result.data,
        meta: result.meta,
    });
}));
exports.getAllTransactions = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield transaction_service_1.TransactionServices.getAllTransactions(query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "All Transactions Retrieved Successfully",
        data: result,
    });
}));
exports.TransactionController = {
    createTransaction: exports.createTransaction,
    getMyTransactions: exports.getMyTransactions,
    getAllTransactions: exports.getAllTransactions
};
