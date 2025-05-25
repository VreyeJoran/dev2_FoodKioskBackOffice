import sql from "./db";

// Interface
export interface Product {
  id: number;
  category_id: number;
  category: string;
  name: string;
  description?: string;
  image_url?: string;
  variants: {
    variant_id: number;
    size: string;
    price: number;
  }[];
}

export interface ProductInserted {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  image_url?: string;
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const data: Product[] = await sql`SELECT
        products.id,
        products.category_id,
        categories.name AS category,
        products.name,
        products.description,
        products.image_url,
        json_agg(
            json_build_object(
            'variant_id', product_variants.id
            'size', product_variants.size,
            'price', product_variants.price
            ) ORDER BY product_variants.id
        ) AS variants
        FROM products
        JOIN categories ON categories.id = products.category_id
        JOIN product_variants ON product_variants.product_id = products.id
        GROUP BY products.id, categories.name
        ORDER BY products.id`;
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Could not fetch product: " + error);
  }
}

export async function getProductById(productId: number): Promise<Product> {
  try {
    const products: Product[] = await sql`
        SELECT
        products.id,
        products.category_id,
        categories.name AS category,
        products.name,
        products.description,
        products.image_url,
        json_agg(
            json_build_object(
                'variant_id', product_variants.id
                'size', product_variants.size,
                'price', product_variants.price
                )
            ) AS variants
        FROM products
        JOIN categories ON categories.id = products.category_id
        JOIN product_variants ON product_variants.product_id = products.id
        WHERE products.id = ${productId}
        GROUP BY products.id, categories.name
        `;

    return products[0];
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw new Error("Could not fetch product: " + (error as Error).message);
  }
}

export async function addNewProduct(product: Product) {
  try {
    const productInserted: ProductInserted[] = await sql`
            INSERT INTO products (category_id, name, description, image_url)
            VALUES (
                ${product.category_id},
                ${product.name},
                ${product.description ?? null},
                ${product.image_url ?? null}
            )
            RETURNING id, category_id, name, description, image_url
        `;
    const newProduct = productInserted[0];

    for (const variant of product.variants) {
      await sql`
                INSERT INTO product_variants (product_id, size, price)
                VALUES (
                    ${newProduct.id},
                    ${variant.size},
                    ${variant.price}
                )
                RETURNING id, product_id, size, price
            `;
    }
  } catch (error) {
    console.error("Error adding new product:", error);
    throw new Error("Could not add new product: " + (error as Error).message);
  }
}

export async function updateProduct(product: Product) {
  try {
    await sql`
        UPDATE products
        SET
        name = ${product.name},
        description = ${product.description ?? null},
        category_id = ${product.category_id},
        image_url = ${product.image_url ?? null}
        WHERE id = ${product.id}
    `;

    await sql`
      DELETE FROM product_variants
      WHERE product_id = ${product.id}
    `;

    for (const variant of product.variants) {
      await sql`
        INSERT INTO product_variants (product_id, size, price)
        VALUES (
          ${product.id},
          ${variant.size},
          ${variant.price}
        )
      `;
    }
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Could not update product: " + (error as Error).message);
  }
}

export async function removeProduct(productId: number) {
  try {
    await sql`DELETE FROM product_variants WHERE product_id = ${productId}`;
    await sql`DELETE FROM products WHERE id = ${productId}`;
  } catch (error) {
    console.error("Error removing product:", error);
    throw new Error("Could not remove product: " + (error as Error).message);
  }
}
