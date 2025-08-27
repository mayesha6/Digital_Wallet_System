"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const transaction_interface_1 = require("./transaction.interface");
const user_interface_1 = require("../user/user.interface");
const transactionSchema = new mongoose_1.Schema({
    transactionType: {
        type: String,
        enum: Object.values(transaction_interface_1.TransactionType),
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    fee: {
        type: Number,
        default: 0,
    },
    commissionRate: {
        type: Number,
        default: function () {
            return this.role === user_interface_1.Role.AGENT ? 10 : 0;
        },
    },
    from: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User", // or "Wallet" depending on your design
    },
    to: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User", // or "Wallet"
    },
    initiatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User", // can be user or agent
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(transaction_interface_1.TransactionStatus),
        default: transaction_interface_1.TransactionStatus.PENDING,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.Transaction = (0, mongoose_1.model)("Transaction", transactionSchema);
