"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_route_1 = require("../module/auth/auth.route");
const user_route_1 = require("../module/user/user.route");
const transaction_route_1 = require("../module/transaction/transaction.route");
const wallet_route_1 = require("../module/wallet/wallet.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_route_1.UserRoutes
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes
    },
    {
        path: "/transaction",
        route: transaction_route_1.TransactionRoutes
    },
    {
        path: "/wallet",
        route: wallet_route_1.WalletRoutes
    },
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
