import express, { Request, Response, Router } from "express";
import path from "path";
import { Product, addNewProduct, getAllProducts, removeProduct } from "./services/productsService";
import { Category, getAllCategories } from "./services/categoriesService";
import { Ingredient, getAllIngredients } from "./services/ingredientsService";
import multer, { FileFilterCallback } from "multer";
import sharp from "sharp";

const router: Router = express.Router();

//Opslagconfiguratie voor multer
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if(file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Enkel afbeeldingen zijn toegestaan!"));
        }
    },
});

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

// router.post("/delete-product/:id", async (req: Request, res: Response) => {
//     const productId = Number(req.params.id);

//     if (isNaN(productId)) {
//         return res.status(400).send("Invalid product ID");
//     }

//     try {
//         await removeProduct(productId);
//         const products = await getAllProducts();

//         res.render("products", {
//             title: "Products",
//             products,
//         });
//     } catch (error) {
//         console.error("Fout bij het verwijderen van product:", error);
//         res.status(500).send("Fout bij het verwijderen van het product.");
//     }
// });

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

router.post("/add-product", upload.single("image"), async (req: Request, res: Response) => {
    if(!req.file) {
        res.status(400).send("Geen afbeelding geüpload.");
        return;
    }

    const { category_id, name, price, description } = req.body;

    const filename = `${Date.now()}.webp`;
    const outputPath = path.join(__dirname, "..", "server", "public", "images", filename);

    try {
        await sharp(req.file.buffer)
         .resize(800, 800)
         .toFormat("webp")
         .toFile(outputPath);

        // Insert into database
        await addNewProduct({
            category_id: Number(category_id),
            name,
            price: Number(price),
            description,
            image_url: filename,
        });

        const products: Product[] = await getAllProducts();

        res.render("products", { 
        title: "Products",
        products 
        });

    } catch (error) {
        console.error("Fout bij het toevoegen van product:", error);
        res.status(500).send("Fout bij het toevoegen van het product.");
    }
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

// API routes

// API: Get all products
router.get("/api/products", async (req: Request, res: Response) => {
    try {
        const products: Product[] = await getAllProducts();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// API: Get all categories
router.get("/api/categories", async (req: Request, res: Response) => {
    try {
        const categories: Category[] = await getAllCategories();
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// API: Get all ingredients
router.get("/api/ingredients", async (req: Request, res: Response) => {
    try {
        const ingredients: Ingredient[] = await getAllIngredients();
        res.json(ingredients);
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        res.status(500).json({ error: "Failed to fetch ingredients" });
    }
});

export default router;
