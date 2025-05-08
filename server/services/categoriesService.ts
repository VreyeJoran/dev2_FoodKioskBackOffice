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
        const data : Category[] = await sql`select categories.id, categories.name, count(categories.id) as number_of_products, categories.description, categories.image_url
        from categories
        join products on products.category_id=categories.id
        group by categories.id
        order by id`;
        return data;

    } catch (error) {
        console.error('Error fetching category:', error);
        throw new Error('Could not fetch category: ' + error);
    }
}