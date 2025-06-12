import sql from "./db";

// Interface
export interface OrderItemIngredient {
  id: number;
  ingredient_id: number;
  ingredient_name?: string;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_variant_id: number;
  product_variant_name?: string;
  quantity: number;
  ingredients: OrderItemIngredient[];
  price: number;
}

export interface Order {
  id: number;
  created_at: string;
  total_price: number;
  is_takeaway: boolean;
  items: OrderItem[];
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const data: Order[] = await sql`
    SELECT 
      orders.id, 
      orders.created_at, 
      orders.total_price, 
      orders.is_takeaway,

      json_agg(
        json_build_object(
          'order_item_id', order_items.id,
          'product_variant_id', order_items.product_variant_id,
          'product_variant_name', products.name || ' (' || product_variants.size || ')',
          'quantity', order_items.quantity,
          'price', order_items.price,
          'ingredients', ingredients.ingredients
        ) ORDER BY order_items.id
      ) AS items

    FROM orders

    JOIN order_items ON orders.id = order_items.order_id
    JOIN product_variants ON order_items.product_variant_id = product_variants.id
    JOIN products ON product_variants.product_id = products.id

    -- LEFT JOIN LATERAL to get nested ingredient data with names
    LEFT JOIN LATERAL (
      SELECT json_agg(
              json_build_object(
                'order_item_ingredient_id', order_item_ingredients.id,
                'ingredient_id', order_item_ingredients.ingredient_id,
                'ingredient_name', ingredients.name,
                'quantity', order_item_ingredients.quantity
              ) ORDER BY order_item_ingredients.id
            ) AS ingredients
      FROM order_item_ingredients
      JOIN ingredients ON order_item_ingredients.ingredient_id = ingredients.id
      WHERE order_item_ingredients.order_item_id = order_items.id
    ) ingredients ON true

    GROUP BY orders.id
    ORDER BY orders.id`;
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Could not fetch orders: " + error);
  }
}

export async function getOrderById(id: number): Promise<Order> {
  try {
    const data: Order[] = await sql`
      SELECT 
      orders.id, 
      orders.created_at, 
      orders.total_price, 
      orders.is_takeaway,

      json_agg(
        json_build_object(
          'order_item_id', order_items.id,
          'product_variant_id', order_items.product_variant_id,
          'product_variant_name', products.name || ' (' || product_variants.size || ')',
          'quantity', order_items.quantity,
          'price', order_items.price,
          'ingredients', ingredients.ingredients
        ) ORDER BY order_items.id
      ) AS items

    FROM orders

    JOIN order_items ON orders.id = order_items.order_id
    JOIN product_variants ON order_items.product_variant_id = product_variants.id
    JOIN products ON product_variants.product_id = products.id

    -- LEFT JOIN LATERAL to get nested ingredient data with names
    LEFT JOIN LATERAL (
      SELECT json_agg(
              json_build_object(
                'order_item_ingredient_id', order_item_ingredients.id,
                'ingredient_id', order_item_ingredients.ingredient_id,
                'ingredient_name', ingredients.name,
                'quantity', order_item_ingredients.quantity
              ) ORDER BY order_item_ingredients.id
            ) AS ingredients
      FROM order_item_ingredients
      JOIN ingredients ON order_item_ingredients.ingredient_id = ingredients.id
      WHERE order_item_ingredients.order_item_id = order_items.id
    ) ingredients ON true

    WHERE orders.id = ${id}
    GROUP BY orders.id
    ORDER BY orders.id
    `;

    if (!data || data.length === 0) {
      throw new Error(`Order with ID ${id} not found`);
    }

    return data[0];
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error("Could not fetch order: " + error);
  }
}

export async function deleteOrder(id: number) {
  try {
    await sql`DELETE FROM orders WHERE id = ${id}`;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw new Error("Could not delete order: " + error);
  }
}

export async function addNewOrder(order: Order) {
  try {
    const [newOrder] = await sql`
      INSERT INTO orders (created_at, total_price, is_takeaway)
      VALUES (${order.created_at}, ${order.total_price}, ${order.is_takeaway})
      RETURNING id
    `;
    const orderId = newOrder.id;

    for (const item of order.items) {
      const [newOrderItem] = await sql`
        INSERT INTO order_items (order_id, quantity, product_variant_id, price)
        VALUES (${orderId}, ${item.quantity}, ${item.product_variant_id}, ${item.price})
        RETURNING id
      `;
      const orderItemId = newOrderItem.id;

      for (const ingredient of item.ingredients) {
        await sql`
          INSERT INTO order_item_ingredients (order_item_id, ingredient_id, quantity)
          VALUES (${orderItemId}, ${ingredient.ingredient_id}, ${ingredient.quantity})
        `;
      }
    }
  } catch (error) {
    console.error(" Error adding new order to DB:", error);
    throw error; // Let the route handler deal with returning the error to the client
  }
}

// Expects json like this:
// {
//   "created_at": "2025-05-22T14:30:00+00:00",
//   "total_price": 29,
//   "is_takeaway": true,
//   "items": [
//     {
//       "product_variant_id": 4,
//       "quantity": 1,
//       "price": 14.5,
//       "ingredients": [
//         { "ingredient_id": 1, "quantity": 1 },
//         { "ingredient_id": 5, "quantity": 1 }
//       ]
//     },
//     {
//       "product_variant_id": 7,
//       "quantity": 2,
//       "price": 7.25,
//       "ingredients": []
//     }
//   ]
// }
