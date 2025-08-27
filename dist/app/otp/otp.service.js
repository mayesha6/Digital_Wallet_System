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
exports.OTPService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = require("../module/user/user.model");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const sendSMS_1 = require("../utils/sendSMS");
const redis_config_1 = require("../config/redis.config");
const OTP_EXPIRATION = 2 * 60; // 2minute
const generateOtp = (length = 6) => {
    //6 digit otp
    const otp = crypto_1.default.randomInt(10 ** (length - 1), 10 ** length).toString();
    // 10 ** 5 => 10 * 10 *10 *10 *10 * 10 => 1000000
    return otp;
};
const sendOTP = (phone, name) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ phone });
    if (!user) {
        throw new AppError_1.default(404, "User not found");
    }
    if (user.isVerified) {
        throw new AppError_1.default(401, "You are already verified");
    }
    const otp = generateOtp();
    const redisKey = `otp:${phone}`;
    yield redis_config_1.redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION
        }
    });
    yield (0, sendSMS_1.sendSMS)({
        to: phone,
        message: `Hi ${name}, your OTP is ${otp}. It is valid for 2 minutes.`,
    });
});
const verifyOTP = (phone, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ phone });
    if (!user) {
        throw new AppError_1.default(404, "User not found");
    }
    if (user.isVerified) {
        throw new AppError_1.default(401, "You are already verified");
    }
    const redisKey = `otp:${phone}`;
    const savedOtp = yield redis_config_1.redisClient.get(redisKey);
    if (!savedOtp) {
        throw new AppError_1.default(401, "Invalid OTP");
    }
    if (savedOtp !== otp) {
        throw new AppError_1.default(401, "Invalid OTP");
    }
    yield Promise.all([
        user_model_1.User.updateOne({ phone }, { isVerified: true }, { runValidators: true }),
        redis_config_1.redisClient.del([redisKey])
    ]);
});
exports.OTPService = {
    sendOTP,
    verifyOTP
};
