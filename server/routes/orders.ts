import express, { Request, Response, Router } from "express";
import path from "path";
import {
  Order,
  deleteOrder,
  getAllOrders,
  getOrderById,
} from "../services/ordersService";

const router: Router = express.Router();

router.get("/orders", async (req: Request, res: Response) => {
  const orders: Order[] = await getAllOrders();

  res.render("orders", { title: "Orders", orders });
});

router.get("/view-order/:id", async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const order = await getOrderById(orderId);
    res.render("view-order", { title: `Order #${orderId}`, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.render("orders", {
      title: "Orders",
      errorMessage: "Error fetching order details. Please try again.",
      orders: await getAllOrders(),
    });
  }
});

router.post("/delete-order/:id", async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  await deleteOrder(orderId);
  res.redirect("/orders");
});

export default router;
