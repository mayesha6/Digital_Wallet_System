import crypto from "crypto";
import { User } from "../module/user/user.model";
import AppError from "../errorHelpers/AppError";
import { sendSMS } from "../utils/sendSMS";
import { redisClient } from "../config/redis.config";
const OTP_EXPIRATION = 2 * 60 // 2minute

const generateOtp = (length = 6) => {
    //6 digit otp
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString()

    // 10 ** 5 => 10 * 10 *10 *10 *10 * 10 => 1000000

    return otp
}

const sendOTP = async (phone: string, name: string) => {

    const user = await User.findOne({ phone })

    if (!user) {
        throw new AppError(404, "User not found")
    }

    if (user.isVerified) {
        throw new AppError(401, "You are already verified")
    }
    const otp = generateOtp();

    const redisKey = `otp:${phone}`

    await redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION
        }
    })

    await sendSMS({
        to: phone,
        message: `Hi ${name}, your OTP is ${otp}. It is valid for 2 minutes.`,
    })
};

const verifyOTP = async (phone: string, otp: string) => {
    const user = await User.findOne({ phone })

    if (!user) {
        throw new AppError(404, "User not found")
    }

    if (user.isVerified) {
        throw new AppError(401, "You are already verified")
    }

    const redisKey = `otp:${phone}`

    const savedOtp = await redisClient.get(redisKey)

    if (!savedOtp) {
        throw new AppError(401, "Invalid OTP");
    }

    if (savedOtp !== otp) {
        throw new AppError(401, "Invalid OTP");
    }


    await Promise.all([
        User.updateOne({ phone }, { isVerified: true }, { runValidators: true }),
        redisClient.del([redisKey])
    ])

};

export const OTPService = {
    sendOTP,
    verifyOTP
}
