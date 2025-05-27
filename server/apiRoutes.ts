import express, { Request, Response, Router } from "express";
import { Product, getAllProducts } from "./services/productsService";
import { Category, getAllCategories } from "./services/categoriesService";
import { Ingredient, getAllIngredients } from "./services/ingredientsService";
import { addNewOrder, Order } from "./services/ordersService";

const router: Router = express.Router();

// API: Get all products
router.get("/products", async (req: Request, res: Response) => {
  try {
    const products: Product[] = await getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// API: Get all categories
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories: Category[] = await getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// API: Get all ingredients
router.get("/ingredients", async (req: Request, res: Response) => {
  try {
    const ingredients: Ingredient[] = await getAllIngredients();
    res.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
});

router.post("/orders", async (req: Request, res: Response) => {
  const order: Order = req.body;

  //simple validation
  if (
    !order ||
    !Array.isArray(order.items) ||
    typeof order.total_price !== "number" ||
    typeof order.created_at !== "string" ||
    typeof order.is_takeaway !== "boolean" ||
    !order.items.every(
      (item) =>
        typeof item.product_variant_id === "number" &&
        typeof item.quantity === "number" &&
        typeof item.price === "number" &&
        Array.isArray(item.ingredients) &&
        item.ingredients.every(
          (ing) =>
            typeof ing.ingredient_id === "number" &&
            typeof ing.quantity === "number"
        )
    )
  ) {
    res.status(400).json({ error: "Invalid order format" });
  }

  try {
    await addNewOrder(order);
    res.status(201).json({ message: "Order created successfully" });
  } catch (error) {
    console.error("Failed to add order:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export default router;
