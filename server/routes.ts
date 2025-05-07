import express, { Request, Response } from "express";
import path from "path";
import { Product, getAllProducts } from "./services/productsService";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    const products: Product[] = await getAllProducts();
  
    res.render("index", { products, title: "All Products" });
});

export default router;
