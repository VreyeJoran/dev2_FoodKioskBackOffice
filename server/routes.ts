import express, { Request, Response, Router } from "express";
import path from "path";
import {
  Product,
  addNewProduct,
  getAllProducts,
  getProductById,
  removeProduct,
  updateProduct,
} from "./services/productsService";
import {
  addNewCategory,
  Category,
  getAllCategories,
  getCategoryById,
  removeCategory,
  updateCategory,
} from "./services/categoriesService";
import {
  Ingredient,
  addNewIngredient,
  getAllIngredients,
  getIngredientById,
  removeIngredient,
  updateIngredient,
} from "./services/ingredientsService";
import multer, { FileFilterCallback } from "multer";
import sharp from "sharp";
import slugify from "slugify";
import sql from "./services/db";

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
    ...dashboardData,
  });
});

// Products routes
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

// Categories routes
router.get("/categories", async (req: Request, res: Response) => {
  const categories: Category[] = await getAllCategories();

  res.render("categories", {
    title: "Categories",
    categories,
  });
});

router.get("/add-category", (req: Request, res: Response) => {
  res.render("add-category", {
    title: "Add New Category",
  });
});

router.post("/add-category", async (req: Request, res: Response) => {
  const { name, description } = req.body;

  try {
    await addNewCategory({
      id: 0, // dummy
      name,
      description,
      image_url: "",
      number_of_products: 0, // dummy
    });

    const categories: Category[] = await getAllCategories();

    res.render("categories", {
      title: "Categories",
      categories,
    });
  } catch (error) {
    console.error("Something went wrong trying to add the category:", error);
    res.render("add-category", {
      title: "Add New Category",
      errorMessage:
        "Something went wrong trying to add the category. Try again.",
      formData: req.body ?? {},
    });
  }
});

router.get("/edit-category/:id", async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);

  const categories: Category[] = await getAllCategories();

  try {
    const category = await getCategoryById(categoryId);

    res.render("edit-category", {
      title: "Edit Category",
      category,
      formData: {},
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.render("categories", {
      title: "Categories",
      errorMessage: "Error fetching category. Try again.",
      categories,
    });
  }
});

router.post("/edit-category/:id", async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.id);
  const { name, description, image_url } = req.body;

  const category = await getCategoryById(categoryId);

  try {
    const existingCategory = await getCategoryById(categoryId);
    if (!existingCategory) {
      return res.status(404).render("edit-category", {
        errorMessage: "Category not found",
        category,
        formData: req.body ?? {},
      });
    }

    // Save to DB
    await updateCategory({
      id: Number(categoryId),
      name,
      description,
      image_url,
      number_of_products: 0, //dummy
    });

    res.redirect("/categories");
  } catch (err) {
    console.error(
      "Something went wrong while trying to edit the category:",
      err
    );
    res.render("edit-category", {
      title: "Edit Category",
      errorMessage:
        "Something went wrong while trying to edit the category. Try again.",
      category,
      formData: req.body ?? {},
    });
  }
});

router.post("/delete-category/:id", async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);
  const categories: Category[] = await getAllCategories();

  try {
    await removeCategory(categoryId);

    res.redirect("/categories");
  } catch (error) {
    console.error("Something went wrong trying to delete the category:", error);
    res.render("products", {
      title: "Products",
      errorMessage:
        "Something went wrong trying to delete the category. Try again.",
      categories,
    });
  }
});

// Ingredients routes
router.get("/ingredients", async (req: Request, res: Response) => {
  const ingredients: Ingredient[] = await getAllIngredients();

  res.render("ingredients", {
    title: "Ingredients",
    ingredients,
  });
});

router.get("/add-ingredient", (req: Request, res: Response) => {
  res.render("add-ingredient", {
    title: "Add New Ingredient",
  });
});

router.post(
  "/add-ingredient",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const { name, type, price } = req.body;

    const image_url = req.file
      ? `images/ingredients/${slugify(type, {
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

      await addNewIngredient({
        id: 0, // dummy
        name,
        type,
        price,
        image_url: image_url ?? "",
      });

      res.redirect("/ingredients");
    } catch (error) {
      console.error(
        "Something went wrong while trying to add the ingredient:",
        error
      );
      res.render("add-ingredient", {
        title: "Add New Ingredient",
        errorMessage:
          "Something went wrong while trying to add the ingredient. Try again.",
        formData: req.body ?? {},
      });
    }
  }
);

router.get("/edit-ingredient/:id", async (req: Request, res: Response) => {
  const ingredientId = Number(req.params.id);

  const ingredients: Ingredient[] = await getAllIngredients();

  try {
    const ingredient = await getIngredientById(ingredientId);

    res.render("edit-ingredient", {
      title: "Edit Ingredient",
      ingredient,
      formData: {},
    });
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    res.render("ingredients", {
      title: "Ingredients",
      errorMessage: "Error fetching ingredient. Try again.",
      ingredients,
    });
  }
});

router.post(
  "/edit-ingredient/:id",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const ingredientId = parseInt(req.params.id);
    const { name, type, price } = req.body;

    const ingredients: Ingredient[] = await getAllIngredients();
    const ingredient = await getIngredientById(ingredientId);

    try {
      if (!ingredient) {
        return res.status(404).render("edit-ingredient", {
          errorMessage: "Ingredient not found",
          ingredient,
          formData: req.body ?? {},
        });
      }

      const image_url = req.file
        ? `images/ingredients/${slugify(type, {
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

      await updateIngredient({
        id: ingredientId,
        name,
        type,
        price,
        image_url: image_url ?? ingredient.image_url,
      });

      res.redirect("/ingredients");
    } catch (err) {
      console.error(
        "Something went wrong while trying to edit the ingredient:",
        err
      );
      res.render("edit-ingredient", {
        title: "Edit Ingredient",
        errorMessage:
          "Something went wrong while trying to edit the ingredient. Try again.",
        ingredient,
        formData: req.body ?? {},
      });
    }
  }
);

router.post("/delete-ingredient/:id", async (req: Request, res: Response) => {
  const ingredientId = Number(req.params.id);
  const ingredients: Ingredient[] = await getAllIngredients();

  try {
    await removeIngredient(ingredientId);

    res.redirect("/ingredients");
  } catch (error) {
    console.error(
      "Something went wrong trying to delete the ingredient:",
      error
    );
    res.render("ingredients", {
      title: "Ingredients",
      errorMessage:
        "Something went wrong trying to delete the ingredient. Try again.",
      ingredients,
    });
  }
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
