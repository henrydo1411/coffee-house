import Order from "../models/Orders.js";
import Product from "../models/Product.js";
import { text, validId, fail } from "../utils/helpers.js";
const choices = {
  size: ["Small", "Medium", "Large"],
  sugarLevel: ["0%", "50%", "100%"],
  iceLevel: ["No Ice", "Less Ice", "Normal Ice"],
  topping: ["None", "Pearl", "Cream"],
};
const defaults = {
  size: "Medium",
  sugarLevel: "50%",
  iceLevel: "Normal Ice",
  topping: "None",
};
export async function createOrder(req, res) {
  const customerName = text(req.body.customerName, "Recipient name", 100);
  const customerPhone = text(req.body.customerPhone, "Phone", 20);
  if (!/^(0[0-9]{9}|\+84[0-9]{9})$/.test(customerPhone))
    throw fail(
      400,
      "Enter a Vietnamese phone number: 10 digits starting with 0, or +84 followed by 9 digits",
    );
  const customerAddress = text(req.body.customerAddress, "Address", 500);
  const note = text(req.body.note ?? "", "Order note", 500, false);
  const { items } = req.body;
  if (!Array.isArray(items) || !items.length || items.length > 100)
    throw fail(400, "Cart must contain 1–100 items");
  const ids = items.map((item) => item?.productId);
  if (ids.some((id) => !validId(id)))
    throw fail(400, "Invalid product in cart");
  const products = await Product.find({ _id: { $in: ids } });
  const lookup = new Map(products.map((p) => [String(p._id), p]));
  const orderItems = items.map((item) => {
    const product = lookup.get(item.productId);
    if (!product)
      throw fail(
        404,
        "A product in your cart was deleted. Remove it and try again.",
      );
    if (product.status !== "Available")
      throw fail(
        409,
        `${product.name} is unavailable. Remove it from your cart.`,
      );
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    )
      throw fail(400, "Quantity must be an integer between 1 and 99");
    const options = {};
    for (const [key, values] of Object.entries(choices)) {
      options[key] = item[key] ?? defaults[key];
      if (!values.includes(options[key])) throw fail(400, `Invalid ${key}`);
    }
    return {
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: item.quantity,
      ...options,
      note: text(item.note ?? "", "Item note", 300, false),
    };
  });
  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  res
    .status(201)
    .json(
      await Order.create({
        user: req.user._id,
        customerName,
        customerPhone,
        customerAddress,
        note,
        items: orderItems,
        total,
        paymentMethod: "COD",
      }),
    );
}
export async function getMyOrders(req, res) {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
}
export async function getAllOrders(req, res) {
  res.json(
    await Order.find().populate("user", "name email").sort({ createdAt: -1 }),
  );
}
export async function updateOrderStatus(req, res) {
  const next = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Completed", "Cancelled"],
    Completed: [],
    Cancelled: [],
  };
  const order = await Order.findById(req.params.id);
  if (!order) throw fail(404, "Order not found");
  if (!next[order.status].includes(req.body.status))
    throw fail(
      409,
      "This order status transition is not allowed. Refresh the list.",
    );
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    { status: req.body.status },
    { returnDocument: "after" },
  ).populate("user", "name email");
  if (!updated)
    throw fail(409, "Order was updated elsewhere. Refresh the list.");
  res.json(updated);
}
