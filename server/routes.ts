import express, { Request, Response } from "express";
import path from "path";
import { Product, getAllProducts } from "./services/productsService";
import { Category, getAllCategories } from "./services/categoriesService";
import { Ingredient, getAllIngredients } from "./services/ingredientsService";

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

router.get("/add-product", async (req: Request, res: Response) => {
    const products: Product[] = await getAllProducts();
    const categories: Category[] = await getAllCategories();
    const ingredients: Ingredient[] = await getAllIngredients();

    res.render("add-product", { 
        title: "Add New Product",
        products,
        categories,
        ingredients
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
    const categories: Category[] = await getAllCategories();
    
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

// Ingredients routes
router.get("/ingredients", async (req: Request, res: Response) => {
    // TODO: Add ingredients fetching
    const ingredients: Ingredient[] = await getAllIngredients();
    
    res.render("ingredients", { 
        title: "Ingredients",
        ingredients 
    });
});

router.get("/ingredients/new", (req: Request, res: Response) => {
    res.render("ingredients/new", { 
        title: "Add New Ingredient" 
    });
});

router.get("/ingredients/edit/:id", async (req: Request, res: Response) => {
    const ingredientId = req.params.id;
    // TODO: Add ingredient fetching by ID
    res.render("ingredients/edit", { 
        title: "Edit Ingredient",
        ingredientId 
    });
});

// Redirect root to dashboard
router.get("/", (req: Request, res: Response) => {
    res.redirect("/dashboard");
});

export default router;
