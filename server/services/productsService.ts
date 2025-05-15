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

export interface addProduct {
    category_id: number;
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

export async function removeProduct(productId: number): Promise<void> {
    try {
        await sql`
            DELETE FROM products
            WHERE id = ${productId}
        `;
    } catch (error) {
        console.error("Error removing product:", error);
        throw new Error("Could not remove product: " + (error as Error).message);
    }
}

export async function addNewProduct(product: addProduct): Promise<Product> {
    try {
        const [newProduct] = await sql<Product[]>`
            INSERT INTO products (category_id, name, price, description, image_url)
            VALUES (
                ${product.category_id},
                ${product.name},
                ${product.price},
                ${product.description ?? null},
                ${product.image_url ?? null}
            )
            RETURNING id, category_id, name, price, description, image_url
        `;
        return newProduct;
    } catch (error) {
        console.error("Error adding new product:", error);
        throw new Error("Could not add new product: " + (error as Error).message);
    }
}