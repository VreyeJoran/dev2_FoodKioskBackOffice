import sql from "./db";

// Interface
export interface Product {
  id: number;
  category_id: number;
  category: string;
  name: string;
  size: string;
  price: number;
  description?: string;
  image_url?: string;
}

export interface AddProduct {
    category_id: number;
    name: string;
    description?: string;
    image_url?: string;
}

export interface ProductInserted {
    id: number;
    category_id: number;
    name: string;
    description?: string;
    image_url?: string;
}

export interface AddProductVariant {
    product_id: number;
    size: string;
    price: number;
}

export async function getAllProducts(): Promise<Product[]> {
    try {
        const data : Product[] = await sql`select products.id, products.category_id, categories.name as category, products.name, product_variants.size, product_variants.price, products.description, products.image_url 
        from products
        join categories on categories.id=products.category_id
        join product_variants on product_variants.product_id=products.id
        order by products.id`;
        return data;

    } catch (error) {
        console.error('Error fetching product:', error);
        throw new Error('Could not fetch product: ' + error);
    }
}

export async function addNewProduct(product: AddProduct): Promise<ProductInserted> {
    try {
        const [newProduct] = await sql<ProductInserted[]>`
            INSERT INTO products (category_id, name, description, image_url)
            VALUES (
                ${product.category_id},
                ${product.name},
                ${product.description ?? null},
                ${product.image_url ?? null}
            )
            RETURNING id, category_id, name, description, image_url
        `;
        return newProduct;
    } catch (error) {
        console.error("Error adding new product:", error);
        throw new Error("Could not add new product: " + (error as Error).message);
    }
}

export async function addNewProductVariant(product: AddProductVariant): Promise<AddProductVariant> {
    try {
        const [newProduct] = await sql<AddProductVariant[]>`
            INSERT INTO product_variants (product_id, size, price)
            VALUES (
                ${product.product_id},
                ${product.size},
                ${product.price}
            )
            RETURNING id, product_id, size, price
        `;
        return newProduct;
    } catch (error) {
        console.error("Error adding new product:", error);
        throw new Error("Could not add new product: " + (error as Error).message);
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