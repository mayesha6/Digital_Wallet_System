import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role, UserStatus } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import { Wallet } from "../wallet/wallet.model";

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

const createUser = async (payload: Partial<IUser>) => {
  const { phone, password, role, ...rest } = payload;
  const finalRole = role ?? Role.USER;
  const isUserExist = await User.findOne({ phone });

  if (isUserExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User already exists with this phone number."
    );
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: phone as string,
  };

  //   const user = await User.create({
  //     phone,
  //     password: hashedPassword,
  //     role,
  //     auths: [authProvider],
  //     isVerified,
  //     ...rest,
  //   });
  const user = await User.create({
    phone,
    password: hashedPassword,
    name: rest.name,
    address: rest.address,
    role: finalRole,
    isVerified: rest.isVerified ?? false,
    auths: [authProvider],
  });
  let wallet = null;
  if (finalRole === Role.USER || finalRole === Role.AGENT) {
    console.log("🟢 Creating wallet for user ID:", user._id);
    wallet = await Wallet.create({
      user: user._id,
      balance: 50,
    });

    await User.findByIdAndUpdate(user._id, { wallet: wallet._id });
  }

  return {
    user,
    wallet,
  };
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user,
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
    if (userId !== decodedToken.userId) {
      throw new AppError(401, "You are not authorized");
    }
  }

  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (
    decodedToken.role === Role.ADMIN &&
    ifUserExist.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(401, "You are not authorized");
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (
    payload.commissionRate &&
    decodedToken.role !== Role.ADMIN &&
    decodedToken.role !== Role.SUPER_ADMIN
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot update commission rate"
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const approveAgent = async (agentId: string) => {
  const user = await User.findById(agentId);
  if (!user || user.role !== Role.AGENT) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }
  user.userStatus = UserStatus.APPROVED;
  await user.save();
  return user;
};

const suspendAgent = async (agentId: string) => {
  const user = await User.findById(agentId);
  if (!user || user.role !== Role.AGENT) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }
  user.userStatus = UserStatus.SUSPENDED;
  await user.save();
  return user;
};


export const UserServices = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  getMe,
  approveAgent,
  suspendAgent
};
