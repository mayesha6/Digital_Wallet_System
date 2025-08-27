"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWalletZodSchema = void 0;
const zod_1 = require("zod");
exports.updateWalletZodSchema = zod_1.z.object({
    isBlocked: zod_1.z.boolean({
        message: "isBlocked must be true or false",
    }),
});
