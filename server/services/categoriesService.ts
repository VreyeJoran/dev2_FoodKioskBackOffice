import sql from "./db";

// Interface
export interface Category {
  id: number;
  name: string;
  number_of_products: number;
  description: string;
  image_url?: string;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const categories: Category[] =
      await sql`SELECT categories.id, categories.name, COUNT(products.id) AS number_of_products, categories.description, categories.image_url
        FROM categories
        LEFT JOIN products ON products.category_id = categories.id
        GROUP BY categories.id
        ORDER BY categories.id`;
    return categories;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw new Error("Could not fetch category: " + error);
  }
}

export async function getCategoryById(categoryId: number): Promise<Category> {
  try {
    const categories: Category[] = await sql`
            SELECT categories.id, categories.name, COUNT(products.id) AS number_of_products, categories.description, categories.image_url
            FROM categories
            LEFT JOIN products ON products.category_id = categories.id
            WHERE categories.id = ${categoryId}
            GROUP BY categories.id, categories.name, categories.description, categories.image_url;
        `;

    return categories[0];
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw new Error("Could not fetch category: " + (error as Error).message);
  }
}

export async function addNewCategory(category: Category) {
  try {
    await sql`
            INSERT INTO categories (name, description)
            VALUES (${category.name}, ${category.description})
        `;
  } catch (error) {
    console.error("Error adding new category:", error);
    throw new Error("Could not add new category: " + (error as Error).message);
  }
}

export async function updateCategory(category: Category) {
  try {
    await sql`
      UPDATE categories
      SET name = ${category.name}, description = ${
      category.description
    }, image_url = ${category.image_url || ""}
      WHERE id = ${category.id}
    `;
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Could not update category: " + (error as Error).message);
  }
}

export async function removeCategory(categoryId: number) {
  try {
    await sql`DELETE FROM categories WHERE id = ${categoryId}`;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Could not delete category: " + (error as Error).message);
  }
}
