import AppError from "../../errorHelpers/AppError";
import httpStatus from 'http-status-codes';
import { User } from "../user/user.model";
import { IAuthProvider, IUser } from "../user/user.interface";
import bcryptjs from 'bcryptjs';
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { sendSMS } from "../../utils/sendSMS";

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { phone, password } = payload;

    const isUserExist = await User.findOne({ phone })

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    }

    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
    }

    const userTokens = createUserTokens(isUserExist)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = isUserExist.toObject()

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    }

}
const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken
    }

}
const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId)

    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string)
    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
    }

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

    user!.save();


}
const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {
    if (payload.id != decodedToken.userId) {
        throw new AppError(401, "You can not reset your password")
    }

    const isUserExist = await User.findById(decodedToken.userId)
    if (!isUserExist) {
        throw new AppError(401, "User does not exist")
    }

    const hashedPassword = await bcryptjs.hash(
        payload.newPassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    )

    isUserExist.password = hashedPassword;

    await isUserExist.save()
}
const setPassword = async (userId: string, plainPassword: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    const hashedPassword = await bcryptjs.hash(
        plainPassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    )

    const credentialProvider: IAuthProvider = {
        provider: "credentials",
        providerId: user.phone
    }

    const auths: IAuthProvider[] = [...user.auths, credentialProvider]

    user.password = hashedPassword

    user.auths = auths

    await user.save()

}
const forgotPassword = async (phone: string) => {
    const isUserExist = await User.findOne({ phone });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist.")
    }
    if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified.")
    }
    
    const jwtPayload = {
        userId: isUserExist._id,
        phone: isUserExist.phone,
        role: isUserExist.role
    }

    const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
        expiresIn: "10m"
    })

    const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`

    sendSMS({
        to: isUserExist.phone,
        message: "Your OTP is 135790. It is valid for 2 minutes.",
    })

}


export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    changePassword,
    resetPassword,
    setPassword,
    forgotPassword
}