
import { Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router()

router.post("/register",
    validateRequest(createUserZodSchema),
    UserControllers.createUser)
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers)
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe)
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getSingleUser)
router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)

router.patch("/approve-agent/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.approveAgent);
router.patch("/suspend-agent/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.suspendAgent);


export const UserRoutes = router