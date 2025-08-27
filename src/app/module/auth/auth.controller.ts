import httpStatus from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import AppError from '../../errorHelpers/AppError';
import { sendResponse } from '../../utils/sendResponse';
import { NextFunction, Request, Response } from 'express';
import { AuthServices } from './auth.service';
import { setAuthCookie } from '../../utils/setCookie';
import { JwtPayload } from 'jsonwebtoken';
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body)

    res.cookie("accessToken", loginInfo.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })

    res.cookie("refreshToken", loginInfo.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })
    
    sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged In Successfully",
            data: {
                accessToken: loginInfo.accessToken,
                refreshToken: loginInfo.refreshToken,
                user: loginInfo.user

            },
        })

})
const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token recieved from cookies")
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string)
    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Access Token Retrived Successfully",
        data: tokenInfo,
    })
})
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true, 
    sameSite: "none", 
    path: "/", 
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Logged Out Successfully",
    data: null,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user

    await AuthServices.changePassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Changed Successfully",
        data: null,
    })
})
const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const decodedToken = req.user

    await AuthServices.resetPassword(req.body, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Changed Successfully",
        data: null,
    })
})
const setPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const decodedToken = req.user as JwtPayload
    const { password } = req.body;

    await AuthServices.setPassword(decodedToken.userId, password);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Changed Successfully",
        data: null,
    })
})
const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


    const { email } = req.body;

    await AuthServices.forgotPassword(email);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Email Sent Successfully",
        data: null,
    })
})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    changePassword,
    resetPassword,
    setPassword,
    forgotPassword
}