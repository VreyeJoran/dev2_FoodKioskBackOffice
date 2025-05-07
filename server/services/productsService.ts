import sql from "./db";

// Interface
export interface Product {
  id: number;
  category_id: number;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

export async function getAllProducts(): Promise<Product[]> {
    try {
        const data : Product[] = await sql`select * from products`;
        return data;

    } catch (error) {
        console.error('Error fetching news:', error);
        throw new Error('Could not fetch news: ' + error);
    }
}