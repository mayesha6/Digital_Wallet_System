import { Router } from "express"
import { AuthRoutes } from "../module/auth/auth.route"
import { UserRoutes } from "../module/user/user.route"
import { TransactionRoutes } from "../module/transaction/transaction.route"
import { WalletRoutes } from "../module/wallet/wallet.route"

export const router = Router()
const moduleRoutes = [
    {
        path: "/user",
        route:UserRoutes
    },
    {
        path: "/auth",
        route:AuthRoutes
    },
    {
        path: "/transaction",
        route:TransactionRoutes
    },
    {
        path: "/wallet",
        route:WalletRoutes
    },
   
]

moduleRoutes.forEach((route)=>{
    router.use(route.path, route.route)
})