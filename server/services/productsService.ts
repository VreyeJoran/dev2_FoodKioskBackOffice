import sql from "./db";

// Interface
export interface Product {
  id: number;
  category_id: number;
  category: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

export async function getAllProducts(): Promise<Product[]> {
    try {
        const data : Product[] = await sql`select products.id, category_id, categories.name as category, products.name, price, products.description, products.image_url 
        from products
        join categories on categories.id=products.category_id
        order by products.id`;
        return data;

    } catch (error) {
        console.error('Error fetching product:', error);
        throw new Error('Could not fetch product: ' + error);
    }
}