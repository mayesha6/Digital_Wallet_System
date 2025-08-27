"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const authProviderSchema = new mongoose_1.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
}, {
    versionKey: false,
    _id: false,
});
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
    },
    phone: { type: String, required: true, unique: true },
    picture: { type: String },
    address: { type: String },
    isVerified: { type: Boolean, default: true },
    commissionRate: {
        type: Number,
        default: function () {
            return this.role === user_interface_1.Role.AGENT ? 70 : 0;
        },
    },
    userStatus: {
        type: String,
        enum: Object.values(user_interface_1.UserStatus),
        default: user_interface_1.UserStatus.PENDING,
    },
    wallet: { type: mongoose_1.Schema.Types.ObjectId, ref: "Wallet" },
    auths: [authProviderSchema],
}, {
    timestamps: true,
    versionKey: false,
});
exports.User = (0, mongoose_1.model)("User", userSchema);
