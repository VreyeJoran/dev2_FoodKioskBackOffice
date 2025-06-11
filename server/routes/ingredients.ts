import express, { Request, Response, Router } from "express";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import sharp from "sharp";
import slugify from "slugify";
import {
  addNewIngredient,
  getAllIngredients,
  getIngredientById,
  Ingredient,
  removeIngredient,
  updateIngredient,
} from "../services/ingredientsService";

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
      cb(new Error("Only images are allowed!"));
    }
  },
});

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

export default router;
