import sql from "./db";

// Interface
export interface Ingredient {
  id: number;
  name: string;
  type: string;
  price: number;
}

export async function getAllIngredients(): Promise<Ingredient[]> {
    try {
        const data : Ingredient[] = await sql`select *
        from ingredients
        order by id`;
        return data;

    } catch (error) {
        console.error('Error fetching ingredient:', error);
        throw new Error('Could not fetch ingredient: ' + error);
    }
}