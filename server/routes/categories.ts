import express, { Request, Response, Router } from "express";
import path from "path";
import slugify from "slugify";
import {
  addNewCategory,
  Category,
  getAllCategories,
  getCategoryById,
  removeCategory,
  updateCategory,
} from "../services/categoriesService";

const router = Router();

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
    res.render("categories", {
      title: "Categories",
      errorMessage:
        "Something went wrong trying to delete the category. Try again.",
      categories,
    });
  }
});

export default router;
