import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { WalletController } from "./wallet.controller";

const router = Router()
// router.post("/create-wallet", checkAuth(Role.USER, Role.AGENT), WalletController.createWallet);
// USER ROUTES
router.post("/add-money", checkAuth(Role.USER, Role.AGENT), WalletController.addMoney);
router.post("/withdraw", checkAuth(Role.USER), WalletController.withdraw);
router.post("/send-money", checkAuth(Role.USER), WalletController.sendMoney);

// AGENT ROUTES
router.post("/cash-in", checkAuth(Role.AGENT), WalletController.cashIn);
router.post("/cash-out", checkAuth(Role.USER), WalletController.cashOut);

// ADMIN ROUTES
router.patch("/block/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletController.blockWallet);
router.patch("/unblock/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletController.unblockWallet);
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletController.getWalletByUserId);


export const WalletRoutes = router;
