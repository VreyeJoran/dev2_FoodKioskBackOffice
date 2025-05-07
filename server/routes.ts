import express, { Request, Response } from "express";
import path from "path";
import { Product, getAllProducts } from "./services/productsService";

const router = express.Router();

// Dashboard route
router.get("/", async (req: Request, res: Response) => {
    // TODO: Add actual data fetching for dashboard stats
    const dashboardData = {
        totalOrders: 1234,
        totalRevenue: 12345,
        mostPopularProduct: "Chicken Burger"
    };
    
    res.render("index", { 
        title: "Dashboard",
        ...dashboardData
    });
});

// Products routes
router.get("/products", async (req: Request, res: Response) => {
    const products: Product[] = await getAllProducts();
    res.render("products", { 
        title: "Products",
        products 
    });
});

router.get("/products/new", (req: Request, res: Response) => {
    res.render("products/new", { 
        title: "Add New Product" 
    });
});

router.get("/products/edit/:id", async (req: Request, res: Response) => {
    const productId = req.params.id;
    // TODO: Add product fetching by ID
    res.render("products/edit", { 
        title: "Edit Product",
        productId 
    });
});

// Categories routes
router.get("/categories", async (req: Request, res: Response) => {
    // TODO: Add categories fetching
    const categories = [
        { id: 1, name: "Burgers", productCount: 5 },
        { id: 2, name: "Sides", productCount: 8 },
        { id: 3, name: "Drinks", productCount: 6 }
    ];
    
    res.render("categories", { 
        title: "Categories",
        categories 
    });
});

router.get("/categories/new", (req: Request, res: Response) => {
    res.render("categories/new", { 
        title: "Add New Category" 
    });
});

router.get("/categories/edit/:id", async (req: Request, res: Response) => {
    const categoryId = req.params.id;
    // TODO: Add category fetching by ID
    res.render("categories/edit", { 
        title: "Edit Category",
        categoryId 
    });
});

// Redirect root to dashboard
router.get("/", (req: Request, res: Response) => {
    res.redirect("/dashboard");
});

export default router;
