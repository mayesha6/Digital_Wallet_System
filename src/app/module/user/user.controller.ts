import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const user = await UserServices.createUser(req.body)
    const userWithWallet = await UserServices.createUser(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Created Successfully",
      data: userWithWallet,
    });
  }
);
const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllUsers(
      query as Record<string, string>
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "All Users Retrieved Successfully",
      data: result,
    });
  }
);
const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Retrieved Successfully",
      data: result,
    });
  }
);
const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const verifiedToken = req.user;
    const payload = req.body;
    const user = await UserServices.updateUser(
      userId,
      payload,
      verifiedToken as JwtPayload
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Updated Successfully",
      data: user,
    });
  }
);
const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const user = await UserServices.getMe(decodedToken.userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Your profile Retrieved Successfully",
      data: user,
    });
  }
);

const approveAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.params.id;
    const updatedAgent = await UserServices.approveAgent(agentId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agent approved successfully",
      data: updatedAgent,
    });
  }
);

const suspendAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.params.id;
    const updatedAgent = await UserServices.suspendAgent(agentId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agent suspended successfully",
      data: updatedAgent,
    });
  }
);

const getOverview = catchAsync(async (req: Request, res: Response) => {
  const overview = await UserServices.getOverview();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Overview data fetched successfully",
    data: overview,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  getMe,
  approveAgent,
  suspendAgent,
  getOverview,
};
