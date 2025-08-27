import { model, Schema } from "mongoose";
import { IAuthProvider, IUser, Role, UserStatus } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(Role),
      
    },
    phone: { type: String, required: true, unique: true },
    picture: { type: String },
    address: { type: String },
    isVerified: { type: Boolean, default: true },
    commissionRate: {
      type: Number,
      default: function () {
        return (this as any).role === Role.AGENT ? 70 : 0;
      },
    },
    
    userStatus: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
    wallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
    auths: [authProviderSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);
