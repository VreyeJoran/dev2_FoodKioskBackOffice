import express, { Request, Response, Router } from "express";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import sharp from "sharp";
import slugify from "slugify";
import {
  addNewProduct,
  getAllProducts,
  getProductById,
  Product,
  removeProduct,
  updateProduct,
} from "../services/productsService";
import {
  Category,
  getAllCategories,
  getCategoryById,
} from "../services/categoriesService";

const router: Router = express.Router();

//Opslagconfiguratie voor multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Enkel afbeeldingen zijn toegestaan!"));
    }
  },
});

router.get("/products", async (req: Request, res: Response) => {
  const products: Product[] = await getAllProducts();
  res.render("products", {
    title: "Products",
    products,
  });
});

router.get("/add-product", async (req: Request, res: Response) => {
  const categories: Category[] = await getAllCategories();

  res.render("add-product", {
    title: "Add New Product",
    categories,
  });
});

router.post(
  "/add-product",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const { category_id, name, size, price, description } = req.body;
    const categories: Category[] = await getAllCategories();
    const category = await getCategoryById(category_id);

    const image_url = req.file
      ? `images/products/${slugify(category.name, {
          lower: true,
          strict: true,
        })}/${slugify(name, { lower: true, strict: true })}.webp`
      : null;
    const outputPath = image_url
      ? path.join(__dirname, "..", "server", "public", image_url)
      : null;

    try {
      if (req.file && outputPath) {
        await sharp(req.file.buffer)
          .resize(250)
          .toFormat("webp")
          .toFile(outputPath!);
      }

      await addNewProduct({
        category_id: Number(category_id),
        name,
        description,
        image_url: image_url ?? "",
        category: category?.name ?? "",
        id: 0, //dummy
        variants: [
          {
            size: size ? size : "Default",
            price: Number(price),
          },
        ],
      });

      res.redirect("/products");
    } catch (error) {
      console.error(
        "Something went wrong while trying to add the product:",
        error
      );
      res.render("add-product", {
        title: "Add New Product",
        errorMessage:
          "Something went wrong while trying to add the product. Try again.",
        categories,
        formData: req.body ?? {},
      });
    }
  }
);

router.get("/edit-product/:id", async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  const products: Product[] = await getAllProducts();
  const categories: Category[] = await getAllCategories();

  try {
    const product = await getProductById(productId);

    res.render("edit-product", {
      title: "Edit Product",
      product,
      categories,
      formData: {},
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.render("products", {
      title: "Products",
      errorMessage: "Error fetching product. Try again.",
      products,
    });
  }
});

router.post(
  "/edit-product/:id",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    const { name, size1, size2, description, price1, price2, category_id } =
      req.body;

    const categories: Category[] = await getAllCategories();
    const product = await getProductById(productId);
    const category = await getCategoryById(category_id);

    try {
      const product = await getProductById(productId);
      if (!product) {
        return res.status(404).render("edit-product", {
          errorMessage: "Product not found",
          product,
          categories,
          formData: req.body ?? {},
        });
      }

      const image_url = req.file
        ? `images/products/${slugify(category.name, {
            lower: true,
            strict: true,
          })}/${slugify(name, { lower: true, strict: true })}.webp`
        : null;
      const outputPath = image_url
        ? path.join(__dirname, "..", "server", "public", image_url)
        : null;

      if (req.file) {
        await sharp(req.file.buffer)
          .resize(250)
          .toFormat("webp")
          .toFile(outputPath!);
      }

      // Construct updated variants
      const variants = [
        {
          size: size1,
          price: parseFloat(price1),
        },
      ];
      if (size2 && price2) {
        variants.push({
          size: size2,
          price: parseFloat(price2),
        });
      }

      // Save to DB
      await updateProduct({
        id: productId,
        category_id: parseInt(category_id),
        category: category.name,
        name,
        description,
        image_url: image_url ?? product.image_url,
        variants,
      });

      // Redirect to products page
      res.redirect("/products");
    } catch (err) {
      console.error(
        "Something went wrong while trying to edit the product:",
        err
      );
      res.render("edit-product", {
        title: "Edit Product",
        errorMessage:
          "Something went wrong while trying to edit the product. Try again.",
        product: product,
        categories,
        formData: req.body ?? {},
      });
    }
  }
);

router.post("/delete-product/:id", async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  const products: Product[] = await getAllProducts();

  try {
    await removeProduct(productId);

    res.redirect("/products");
  } catch (error) {
    console.error(
      "Something went wrong while trying to remove the product:",
      error
    );
    res.render("products", {
      title: "Products",
      errorMessage:
        "Something went wrong while trying to remove the product. Try again.",
      products,
    });
  }
});

export default router;
