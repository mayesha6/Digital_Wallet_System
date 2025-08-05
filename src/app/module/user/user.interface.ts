import { Types } from "mongoose";

export interface IAuthProvider {
  provider: "credentials";
  providerId: string;
}

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}

export enum UserStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  password: string;
  phone: string;
  picture?: string;
  address?: string;
  isVerified?: boolean;
  auths: IAuthProvider[];
  wallet?: Types.ObjectId;
  role: Role;
  commissionRate?: number;
  userStatus?: UserStatus
  createdAt?: Date;
  updatedAt?: Date;
}
