import { JwtPayload } from "jsonwebtoken"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError"
import { IUser } from "../module/user/user.interface"
import { User } from "../module/user/user.model"
import { generateToken, verifyToken } from "./jwt"
import httpStatus from 'http-status-codes';

export const createUserTokens = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id,
        phone: user.phone,
        role: user.role
    }
    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)

    return {
        accessToken,
        refreshToken
    }
}


export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {

    const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload


    const isUserExist = await User.findOne({ email: verifiedRefreshToken.email })

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    }

    const jwtPayload = {
        userId: isUserExist._id,
        phone: isUserExist.phone,
        role: isUserExist.role
    }
    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    return accessToken
}