import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TransactionServices } from "./transaction.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes';
import { JwtPayload } from "jsonwebtoken";

export const createTransaction = catchAsync(
  async (req: Request, res: Response, next:NextFunction) => {
    const result = await TransactionServices.createTransaction(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Transaction create Successfully",
        data: result,
    })
  }
);

export const getMyTransactions = catchAsync(
  async (req: Request, res: Response, next:NextFunction) => {
    const myTransaction = req.user as JwtPayload
    const result = await TransactionServices.getMyTransactions(myTransaction.userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Your Transaction Retrieved Successfully",
        data: result,
    })
  }
);

export const getAllTransactions = catchAsync(
  async (req: Request, res: Response, next:NextFunction) => {
    const query = req.query
    const result = await TransactionServices.getAllTransactions(query as Record<string, string>);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Transactions Retrieved Successfully",
        data: result,
    })
  }
);

export const TransactionController = {
    createTransaction,
    getMyTransactions,
    getAllTransactions
}
