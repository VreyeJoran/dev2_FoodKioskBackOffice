import sql from "./db";

// Interface
export interface Ingredient {
  id: number;
  name: string;
  type: string;
  price: number;
  image_url?: string;
}

export async function getAllIngredients(): Promise<Ingredient[]> {
  try {
    const data: Ingredient[] = await sql`select *
        from ingredients
        order by id`;
    return data;
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    throw new Error("Could not fetch ingredient: " + error);
  }
}

export async function getIngredientById(
  ingredientId: number
): Promise<Ingredient> {
  try {
    const ingredients: Ingredient[] = await sql`
            SELECT *
            FROM ingredients
            WHERE ingredients.id = ${ingredientId}
        `;

    return ingredients[0];
  } catch (error) {
    console.error("Error fetching ingredient by ID:", error);
    throw new Error("Could not fetch ingredient: " + (error as Error).message);
  }
}

export async function addNewIngredient(ingredient: Ingredient) {
  try {
    await sql`
      INSERT INTO ingredients (name, type, price, image_url)
      VALUES (${ingredient.name}, ${ingredient.type}, ${ingredient.price}, ${
      ingredient.image_url ?? ""
    })
    `;
  } catch (error) {
    console.error("Error adding new ingredient:", error);
    throw new Error(
      "Could not add new ingredient: " + (error as Error).message
    );
  }
}

export async function updateIngredient(ingredient: Ingredient) {
  try {
    await sql`
      UPDATE ingredients
      SET 
        name = ${ingredient.name},
        type = ${ingredient.type},
        price = ${ingredient.price},
        image_url = ${ingredient.image_url ?? ""}
      WHERE id = ${ingredient.id}
    `;
  } catch (error) {
    console.error("Error updating ingredient:", error);
    throw new Error("Could not update ingredient: " + (error as Error).message);
  }
}

export async function removeIngredient(ingredientId: number) {
  try {
    await sql`DELETE FROM ingredients WHERE id = ${ingredientId}`;
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    throw new Error("Could not delete ingredient: " + (error as Error).message);
  }
}
