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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const user_constant_1 = require("./user.constant");
const wallet_model_1 = require("../wallet/wallet.model");
const transaction_model_1 = require("../transaction/transaction.model");
// const createUser = async (payload: Partial<IUser>) => {
//   const { phone, password, ...rest } = payload;
//   const isUserExist = await User.findOne({ phone });
//   if (isUserExist) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "User already exist with this phone number. Change your phone number and try again. Thank You."
//     );
//   }
//   const hashedPassword = await bcryptjs.hash(
//     password as string,
//     Number(envVars.BCRYPT_SALT_ROUND)
//   );
//   const authProvider: IAuthProvider = {
//     provider: "credentials",
//     providerId: phone as string,
//   };
//   const user = await User.create({
//     phone,
//     password: hashedPassword,
//     auths: [authProvider],
//     ...rest,
//   });
//   const balance =
//     payload.role === Role.AGENT || payload.role === Role.USER ? 50 : 0;
//   await Wallet.create([
//     {
//       user: user._id,
//       balance,
//       isBlocked: false,
//     },
//   ]);
//   return user;
// };
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { phone, password, role } = payload, rest = __rest(payload, ["phone", "password", "role"]);
    const finalRole = role !== null && role !== void 0 ? role : user_interface_1.Role.USER;
    const isUserExist = yield user_model_1.User.findOne({ phone });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User already exists with this phone number.");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const authProvider = {
        provider: "credentials",
        providerId: phone,
    };
    //   const user = await User.create({
    //     phone,
    //     password: hashedPassword,
    //     role,
    //     auths: [authProvider],
    //     isVerified,
    //     ...rest,
    //   });
    const user = yield user_model_1.User.create({
        phone,
        password: hashedPassword,
        name: rest.name,
        address: rest.address,
        role: finalRole,
        // isVerified: rest.isVerified ?? false,
        isVerified: (_a = rest.isVerified) !== null && _a !== void 0 ? _a : true,
        auths: [authProvider],
    });
    let wallet = null;
    if (finalRole === user_interface_1.Role.USER || finalRole === user_interface_1.Role.AGENT) {
        console.log("🟢 Creating wallet for user ID:", user._id);
        wallet = yield wallet_model_1.Wallet.create({
            user: user._id,
            balance: 50,
        });
        yield user_model_1.User.findByIdAndUpdate(user._id, { wallet: wallet._id });
    }
    return {
        user,
        wallet,
    };
});
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find(), query);
    const usersData = queryBuilder
        .filter()
        .search(user_constant_1.userSearchableFields)
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        usersData.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id).select("-password");
    return {
        data: user,
    };
});
const updateUser = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.AGENT) {
        if (userId !== decodedToken.userId) {
            throw new AppError_1.default(401, "You are not authorized");
        }
    }
    const ifUserExist = yield user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    if (decodedToken.role === user_interface_1.Role.ADMIN &&
        ifUserExist.role === user_interface_1.Role.SUPER_ADMIN) {
        throw new AppError_1.default(401, "You are not authorized");
    }
    if (payload.role) {
        if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.AGENT) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.isVerified) {
        if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.AGENT) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.commissionRate &&
        decodedToken.role !== user_interface_1.Role.ADMIN &&
        decodedToken.role !== user_interface_1.Role.SUPER_ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You cannot update commission rate");
    }
    const newUpdatedUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });
    return newUpdatedUser;
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId)
        .select("-password")
        .populate("wallet");
    return {
        data: user,
    };
});
const approveAgent = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(agentId);
    if (!user || user.role !== user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    user.userStatus = user_interface_1.UserStatus.APPROVED;
    yield user.save();
    return user;
});
const suspendAgent = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(agentId);
    if (!user || user.role !== user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    user.userStatus = user_interface_1.UserStatus.SUSPENDED;
    yield user.save();
    return user;
});
const getOverview = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const totalUsers = yield user_model_1.User.countDocuments();
    const totalAgents = yield user_model_1.User.countDocuments({ role: user_interface_1.Role.AGENT });
    const transactionCount = yield transaction_model_1.Transaction.countDocuments();
    const transactionVolumeAgg = yield transaction_model_1.Transaction.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const transactionVolume = ((_a = transactionVolumeAgg[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    return { totalUsers, totalAgents, transactionCount, transactionVolume };
});
exports.UserServices = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    getMe,
    approveAgent,
    suspendAgent,
    getOverview,
};
