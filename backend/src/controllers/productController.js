import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { text, fail, validId } from "../utils/helpers.js";
async function fields(body) {
  const name = text(body.name, "Product name", 150);
  if (
    typeof body.price !== "number" ||
    !Number.isFinite(body.price) ||
    body.price <= 0 ||
    body.price > 100000000
  )
    throw fail(400, "Price must be between 1 and 100,000,000 VND");
  if (
    !validId(body.category) ||
    !(await Category.exists({ _id: body.category }))
  )
    throw fail(400, "Select an existing category");
  const status = body.status || "Available";
  if (!["Available", "Unavailable"].includes(status))
    throw fail(400, "Invalid product status");
  const image = text(body.image ?? "", "Image URL", 2000, false);
  if (image && !/^https?:\/\//i.test(image))
    throw fail(400, "Image must be an http or https URL");
  return {
    name,
    price: body.price,
    category: body.category,
    status,
    image,
    description: text(body.description ?? "", "Description", 3000, false),
  };
}
export async function getProducts(req, res) {
  const filter = {};
  if (req.query.category) {
    if (!validId(req.query.category)) throw fail(400, "Invalid category");
    filter.category = req.query.category;
  }
  res.json(
    await Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 }),
  );
}
export async function getProduct(req, res) {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name",
  );
  if (!product) throw fail(404, "Product not found");
  res.json(product);
}
export async function createProduct(req, res) {
  const product = await Product.create(await fields(req.body));
  res.status(201).json(await product.populate("category", "name"));
}
export async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    await fields(req.body),
    { returnDocument: "after", runValidators: true },
  );
  if (!product) throw fail(404, "Product not found");
  res.json(await product.populate("category", "name"));
}
export async function deleteProduct(req, res) {
  if (!(await Product.findByIdAndDelete(req.params.id)))
    throw fail(404, "Product not found");
  res.json({ message: "Product deleted" });
}
