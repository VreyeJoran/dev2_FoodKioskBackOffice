import sql from "./db";

// Interface
export interface OrderItemIngredient {
  id: number;
  ingredient_id: number;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_variant_id: number;
  quantity: number;
  ingredients: OrderItemIngredient[];
}

export interface Order {
  id: number;
  created_at: string;
  total_price: number;
  is_takeaway: boolean;
  items: OrderItem[];
}

export async function addNewOrder(order: Order) {
  try {
    const [newOrder] = await sql`
      INSERT INTO orders (order_time, total_price, is_takeaway)
      VALUES (${order.created_at}, ${order.total_price}, ${order.is_takeaway})
      RETURNING id
    `;
    const orderId = newOrder.id;

    for (const item of order.items) {
      const [newOrderItem] = await sql`
        INSERT INTO order_items (order_id, quantity, product_variant_id)
        VALUES (${orderId}, ${item.quantity}, ${item.product_variant_id})
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
