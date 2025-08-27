"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const wallet_controller_1 = require("./wallet.controller");
const router = (0, express_1.Router)();
// router.post("/create-wallet", checkAuth(Role.USER, Role.AGENT), WalletController.createWallet);
// USER ROUTES
router.post("/add-money", (0, checkAuth_1.checkAuth)(user_interface_1.Role.USER, user_interface_1.Role.AGENT), wallet_controller_1.WalletController.addMoney);
router.post("/withdraw", (0, checkAuth_1.checkAuth)(user_interface_1.Role.USER), wallet_controller_1.WalletController.withdraw);
router.post("/send-money", (0, checkAuth_1.checkAuth)(user_interface_1.Role.USER), wallet_controller_1.WalletController.sendMoney);
// AGENT ROUTES
router.post("/cash-in", (0, checkAuth_1.checkAuth)(user_interface_1.Role.AGENT), wallet_controller_1.WalletController.cashIn);
router.post("/cash-out", (0, checkAuth_1.checkAuth)(user_interface_1.Role.USER), wallet_controller_1.WalletController.cashOut);
// ADMIN ROUTES
router.patch("/block/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), wallet_controller_1.WalletController.blockWallet);
router.patch("/unblock/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), wallet_controller_1.WalletController.unblockWallet);
router.get("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), wallet_controller_1.WalletController.getWalletByUserId);
exports.WalletRoutes = router;
