import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionController } from "./transaction.controller";


const router = Router();

router.get("/create-transaction", checkAuth(Role.USER, Role.AGENT), TransactionController.createTransaction);
router.get("/my-transaction", checkAuth(Role.USER, Role.AGENT), TransactionController.getMyTransactions);
// router.get("/commissions", checkAuth(Role.AGENT), TransactionController.getCommissionHistory);
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TransactionController.getAllTransactions);

export const TransactionRoutes = router;

