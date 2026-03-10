import express  from "express"
import authMiddleware from "../middleware/auth.js"
import { placeOrder, getUserOrders, updateOrderStatus } from "../controllers/orderController.js"

const orderRouter = express.Router();

orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.get("/user",authMiddleware,getUserOrders);
// patch status (e.g. cancel) for user's own order
orderRouter.patch("/:id/status",authMiddleware,updateOrderStatus);

export  default orderRouter;