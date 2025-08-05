import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { WalletServices } from "./wallet.service";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from 'http-status-codes';
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";

const createWallet = catchAsync(async (req: Request, res: Response) => {
  const result = await WalletServices.createWallet(req.body);
  res.status(201).json({ success: true, data: result });
});

const getWalletByUserId = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await WalletServices.getWalletByUserId(userId);
  res.status(200).json({ success: true, data: result });
});

const blockWallet = catchAsync(async (req: Request, res: Response) => {
  const walletId = req.params.id;
  const result = await WalletServices.blockWallet(walletId);
  res
    .status(200)
    .json({ success: true, message: "Wallet blocked", data: result });
});

const unblockWallet = catchAsync(async (req: Request, res: Response) => {
  const walletId = req.params.id;
  const result = await WalletServices.unblockWallet(walletId);
  res
    .status(200)
    .json({ success: true, message: "Wallet unblocked", data: result });
});

const addMoney = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload;  
  const amount = Number(req.body.amount);
const wallet = await WalletServices.addMoney(decodedToken.userId, amount)

  sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Money added to wallet successfully.",
        data: wallet,
    })
});

const withdraw = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload;  
  const withdrawAmount = Number(req.body.withdrawAmount);
const wallet = await WalletServices.withdraw(decodedToken.userId, withdrawAmount)

  sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Money withdraw from wallet successfully.",
        data: wallet,
    })
});

const sendMoney = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload;  
  const { receiverPhone, amount } = req.body;

  if (!receiverPhone) {
    throw new AppError(httpStatus.BAD_REQUEST, "Receiver phone number is required");
  }
const wallet = await WalletServices.sendMoney(decodedToken.userId, receiverPhone, Number(amount))

  sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Money send from wallet successfully.",
        data: wallet,
    })
});

const cashIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload;
  const { phone, amount } = req.body;

  const wallet = await WalletServices.cashIn(decodedToken.userId, phone, Number(amount));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cash-in successful",
    data: wallet,
  });
});

const cashOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload;
  const { agentPhone, amount } = req.body;

  const wallet = await WalletServices.cashOut(decodedToken.userId, agentPhone, Number(amount));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cash-out successful",
    data: wallet,
  });
});  //01742363910 - utsho, 01712363910- maya



export const WalletController = {
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
