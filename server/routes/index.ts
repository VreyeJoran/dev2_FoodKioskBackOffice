import express, { Request, Response, Router } from "express";
import categoriesRoutes from "./categories";
import ingredientsRoutes from "./ingredients";
import productsRoutes from "./products";
import ordersRoutes from "./orders";
import { getAllOrders, Order } from "../services/ordersService";

const router = Router();

router.use(categoriesRoutes);
router.use(ingredientsRoutes);
router.use(productsRoutes);
router.use(ordersRoutes);

// Dashboard route
router.get("/dashboard", async (req: Request, res: Response) => {
  console.log("Root route handler called");
  try {
    const orders: Order[] = await getAllOrders();
    console.log("Orders fetched successfully");
    res.render("index", {
      title: "Dashboard",
      orders,
    });
  } catch (error) {
    console.error("Error in root route handler:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/", (req: Request, res: Response) => {
  res.redirect("/dashboard");
});

export default router;
