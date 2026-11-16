import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import app from "../app.js";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
let mongo, server, base;
process.env.JWT_SECRET = "integration-test-secret-only";
before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await User.init();
  await mongoose.model("Category").init();
  await User.create({
    name: "Admin",
    email: "admin@test.local",
    password: await bcrypt.hash("Admin123!", 10),
    role: "admin",
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
async function call(method, path, body, token) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}
test("customer and admin journeys use real MongoDB", async (t) => {
  let admin, customer, second, category, product, order;
  await t.test(
    "register hashes passwords, rejects duplicate and short passwords",
    async () => {
      const result = await call("POST", "/auth/register", {
        name: "Customer",
        email: " CUSTOMER@test.local ",
        password: "Customer123!",
        role: "admin",
      });
      assert.equal(result.status, 201);
      customer = result.data;
      assert.equal(customer.role, "customer");
      assert.equal(customer.email, "customer@test.local");
      assert.ok(customer.token);
      assert.equal(customer.password, undefined);
      const stored = await User.findById(customer._id);
      assert.notEqual(stored.password, "Customer123!");
      assert.equal(
        (
          await call("POST", "/auth/register", {
            name: "C",
            email: "customer@test.local",
            password: "Customer123!",
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await call("POST", "/auth/register", {
            name: "C",
            email: "short@test.local",
            password: "123",
          })
        ).status,
        400,
      );
      second = (
        await call("POST", "/auth/register", {
          name: "Second",
          email: "second@test.local",
          password: "Customer123!",
        })
      ).data;
    },
  );
  await t.test("login and current session", async () => {
    assert.equal(
      (
        await call("POST", "/auth/login", {
          email: "customer@test.local",
          password: "wrong",
        })
      ).status,
      401,
    );
    admin = (
      await call("POST", "/auth/login", {
        email: "admin@test.local",
        password: "Admin123!",
      })
    ).data;
    assert.ok(admin.token);
    assert.equal(
      (await call("GET", "/auth/me", null, customer.token)).data._id,
      customer._id,
    );
    assert.equal(
      (await call("GET", "/auth/me", null, "bad-token")).status,
      401,
    );
  });
  await t.test("admin-only data is protected", async () => {
    assert.equal((await call("GET", "/users")).status, 401);
    assert.equal(
      (await call("GET", "/users", null, customer.token)).status,
      403,
    );
    const result = await call("GET", "/users", null, admin.token);
    assert.equal(result.status, 200);
    assert.equal(result.data.length, 3);
    assert.ok(result.data.every((u) => !u.password));
    assert.equal(
      (await call("POST", "/categories", { name: "No" }, customer.token))
        .status,
      403,
    );
  });
  await t.test("category CRUD and duplicate validation", async () => {
    const result = await call(
      "POST",
      "/categories",
      { name: "Coffee" },
      admin.token,
    );
    assert.equal(result.status, 201);
    category = result.data;
    assert.equal(
      (await call("POST", "/categories", { name: "Coffee" }, admin.token))
        .status,
      409,
    );
    assert.equal(
      (await call("POST", "/categories", { name: "   " }, admin.token)).status,
      400,
    );
    assert.equal(
      (
        await call(
          "PUT",
          `/categories/${category._id}`,
          { name: "Fresh Coffee" },
          admin.token,
        )
      ).data.name,
      "Fresh Coffee",
    );
  });
  await t.test(
    "product create, detail, filter, update and invalid inputs",
    async () => {
      const body = {
        name: "Latte",
        price: 40000,
        category: category._id,
        image: "",
        status: "Available",
      };
      const result = await call("POST", "/products", body, admin.token);
      assert.equal(result.status, 201);
      product = result.data;
      assert.equal(product.category.name, "Fresh Coffee");
      assert.equal((await call("GET", `/products/${product._id}`)).status, 200);
      assert.equal(
        (await call("GET", `/products?category=${category._id}`)).data.length,
        1,
      );
      assert.equal((await call("GET", "/products/not-an-id")).status, 400);
      assert.equal(
        (await call("GET", "/products/000000000000000000000000")).status,
        404,
      );
      assert.equal(
        (await call("POST", "/products", { ...body, price: -1 }, admin.token))
          .status,
        400,
      );
      assert.equal(
        (
          await call(
            "POST",
            "/products",
            { ...body, category: "000000000000000000000000" },
            admin.token,
          )
        ).status,
        400,
      );
      product = (
        await call(
          "PUT",
          `/products/${product._id}`,
          { ...body, price: 45000 },
          admin.token,
        )
      ).data;
      assert.equal(product.price, 45000);
      assert.equal(
        (await call("DELETE", `/categories/${category._id}`, null, admin.token))
          .status,
        409,
      );
    },
  );
  const body = () => ({
    customerName: "Customer",
    customerPhone: "0912345678",
    customerAddress: "FPT University",
    items: [
      {
        productId: product._id,
        quantity: 2,
        size: "Large",
        topping: "Pearl",
        note: "Separate cups",
      },
    ],
    total: 1,
    status: "Completed",
    user: second._id,
  });
  await t.test(
    "checkout rejects invalid carts and unavailable products",
    async () => {
      assert.equal((await call("POST", "/orders", body())).status, 401);
      assert.equal(
        (
          await call(
            "POST",
            "/orders",
            { ...body(), items: [] },
            customer.token,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await call(
            "POST",
            "/orders",
            { ...body(), customerPhone: "12" },
            customer.token,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await call(
            "POST",
            "/orders",
            { ...body(), items: [{ productId: product._id, quantity: 1.5 }] },
            customer.token,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await call(
            "POST",
            "/orders",
            {
              ...body(),
              items: [{ productId: product._id, quantity: 1, size: "Invalid" }],
            },
            customer.token,
          )
        ).status,
        400,
      );
      await Product.findByIdAndUpdate(product._id, { status: "Unavailable" });
      assert.equal(
        (await call("POST", "/orders", body(), customer.token)).status,
        409,
      );
      await Product.findByIdAndUpdate(product._id, { status: "Available" });
    },
  );
  await t.test(
    "checkout recalculates total, preserves phone and isolates order history",
    async () => {
      const result = await call("POST", "/orders", body(), customer.token);
      assert.equal(result.status, 201);
      order = result.data;
      assert.equal(order.total, 90000);
      assert.equal(order.customerPhone, "0912345678");
      assert.equal(order.status, "Pending");
      assert.equal(order.user, customer._id);
      assert.equal(order.items[0].note, "Separate cups");
      assert.equal(
        (await call("GET", "/orders/my", null, customer.token)).data.length,
        1,
      );
      assert.equal(
        (await call("GET", "/orders/my", null, second.token)).data.length,
        0,
      );
      assert.equal(
        (await call("GET", "/orders", null, customer.token)).status,
        403,
      );
      assert.equal(
        (await call("GET", "/orders", null, admin.token)).data.length,
        1,
      );
    },
  );
  await t.test(
    "order transitions are enforced and historical prices are snapshots",
    async () => {
      assert.equal(
        (
          await call(
            "PUT",
            `/orders/${order._id}/status`,
            { status: "Completed" },
            customer.token,
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await call(
            "PUT",
            `/orders/${order._id}/status`,
            { status: "Completed" },
            admin.token,
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await call(
            "PUT",
            `/orders/${order._id}/status`,
            { status: "Confirmed" },
            admin.token,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await call(
            "PUT",
            `/orders/${order._id}/status`,
            { status: "Completed" },
            admin.token,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await call(
            "PUT",
            `/orders/${order._id}/status`,
            { status: "Pending" },
            admin.token,
          )
        ).status,
        409,
      );
      await Product.findByIdAndUpdate(product._id, { price: 99999 });
      assert.equal(
        (await call("GET", "/orders/my", null, customer.token)).data[0].total,
        90000,
      );
      const pending = (await call("POST", "/orders", body(), customer.token))
        .data;
      assert.equal(
        (
          await call(
            "PUT",
            `/orders/${pending._id}/status`,
            { status: "Cancelled" },
            admin.token,
          )
        ).status,
        200,
      );
    },
  );
  await t.test(
    "user update, role change, deletion and self-protection",
    async () => {
      assert.equal(
        (await call("DELETE", `/users/${admin._id}`, null, admin.token)).status,
        400,
      );
      assert.equal(
        (
          await call(
            "PUT",
            `/users/${admin._id}`,
            { name: "Admin", email: admin.email, role: "customer" },
            admin.token,
          )
        ).status,
        400,
      );
      const updated = await call(
        "PUT",
        `/users/${second._id}`,
        {
          name: "Second Updated",
          email: "second.updated@test.local",
          role: "admin",
        },
        admin.token,
      );
      assert.equal(updated.status, 200);
      assert.equal(updated.data.role, "admin");
      assert.equal(
        (await call("DELETE", `/users/${second._id}`, null, admin.token))
          .status,
        400,
      );
      assert.equal(
        (
          await call(
            "PUT",
            `/users/${second._id}`,
            {
              name: "Second Updated",
              email: "second.updated@test.local",
              role: "customer",
            },
            admin.token,
          )
        ).status,
        200,
      );
      assert.equal(
        (await call("DELETE", `/users/${second._id}`, null, admin.token))
          .status,
        200,
      );
      assert.equal(
        (await call("GET", "/auth/me", null, second.token)).status,
        401,
      );
    },
  );
  await t.test(
    "product deletion preserves order detail; empty categories can be deleted",
    async () => {
      assert.equal(
        (await call("DELETE", `/products/${product._id}`, null, admin.token))
          .status,
        200,
      );
      assert.equal(
        (await call("GET", "/orders/my", null, customer.token)).data[0].items[0]
          .name,
        "Latte",
      );
      assert.equal(
        (await call("DELETE", `/categories/${category._id}`, null, admin.token))
          .status,
        200,
      );
      assert.equal((await call("GET", "/does-not-exist")).status, 404);
    },
  );
});
