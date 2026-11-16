import "dotenv/config";
import fs from "node:fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Category from "./src/models/Category.js";
import Product from "./src/models/Product.js";
import User from "./src/models/User.js";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
try {
  if (
    !process.env.MONGODB_URI ||
    !process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD.length < 8
  )
    throw new Error(
      "Set MONGODB_URI and ADMIN_PASSWORD (8+ characters) in .env",
    );
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  const data = JSON.parse(
    fs.readFileSync(
      new URL("../frontend/src/data/db.json", import.meta.url),
      "utf8",
    ),
  );
  const map = {};
  for (const category of data.categories) {
    map[String(category.id)] = await Category.findOneAndUpdate(
      { name: category.name.trim() },
      { $setOnInsert: { name: category.name.trim() } },
      { upsert: true, returnDocument: "after" },
    );
  }
  for (const p of data.products) {
    await Product.findOneAndUpdate(
      { name: p.name },
      {
        $setOnInsert: {
          name: p.name,
          price: p.price,
          image: p.image,
          description: p.description,
          category: map[String(p.categoryId)]._id,
          status: "Available",
        },
      },
      { upsert: true, runValidators: true },
    );
  }
  const email = (process.env.ADMIN_EMAIL || "admin@coffeehouse.local")
    .trim()
    .toLowerCase();
  if (!(await User.exists({ email }))) {
    await User.create({
      name: "Coffee House Admin",
      email,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      role: "admin",
    });
    console.log(`Admin created: ${email}`);
  } else console.log("Admin email already exists; account kept unchanged.");
  console.log(
    "Seed complete. Existing products, orders and accounts were preserved.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
