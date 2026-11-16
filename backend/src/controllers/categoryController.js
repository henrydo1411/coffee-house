import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { text, fail } from "../utils/helpers.js";
export async function getCategories(req, res) {
  res.json(await Category.find().sort({ name: 1 }));
}
export async function createCategory(req, res) {
  res
    .status(201)
    .json(
      await Category.create({ name: text(req.body.name, "Category name", 80) }),
    );
}
export async function updateCategory(req, res) {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: text(req.body.name, "Category name", 80) },
    { returnDocument: "after", runValidators: true },
  );
  if (!category) throw fail(404, "Category not found");
  res.json(category);
}
export async function deleteCategory(req, res) {
  if (await Product.exists({ category: req.params.id }))
    throw fail(409, "Move or delete this category's products first");
  if (!(await Category.findByIdAndDelete(req.params.id)))
    throw fail(404, "Category not found");
  res.json({ message: "Category deleted" });
}
