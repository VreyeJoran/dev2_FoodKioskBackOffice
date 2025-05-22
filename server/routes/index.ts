import express, { Request, Response, Router } from "express";
import categoriesRoutes from "./categories";
import ingredientsRoutes from "./ingredients";
import productsRoutes from "./products";

const router = Router();

router.use(categoriesRoutes);
router.use(ingredientsRoutes);
router.use(productsRoutes);

// Dashboard route
router.get("/dashboard", async (req: Request, res: Response) => {
  // TODO: Add actual data fetching for dashboard stats
  const dashboardData = {
    totalOrders: 1234,
    totalRevenue: 12345,
    mostPopularProduct: "Chicken Burger",
  };

  res.render("index", {
    title: "Dashboard",
    dashboardData,
  });
});

// Redirect root to dashboard
router.get("/", (req: Request, res: Response) => {
  res.redirect("/dashboard");
});

export default router;
