import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  cleanup,
} from "@testing-library/react";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import api, { SESSION_KEY } from "./services/api";
jest.mock("./services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  SESSION_KEY: "coffee_house_session_v2",
  savedSession: () =>
    JSON.parse(global.localStorage.getItem("coffee_house_session_v2")),
  errorMessage: (e) => e.message,
}));
const customer = {
  _id: "customer1",
  name: "Test Customer",
  email: "customer@test.local",
  role: "customer",
  token: "customer-token",
};
const admin = {
  _id: "admin1",
  name: "Admin",
  email: "admin@test.local",
  role: "admin",
  token: "admin-token",
};
let products, categories, orders, users;
const good = (data) => Promise.resolve({ data });
const input = (label, value) =>
  fireEvent.change(screen.getByLabelText(label, { exact: true }), {
    target: { value },
  });
const click = (name) =>
  fireEvent.click(screen.getByRole("button", { name, exact: true }));
const renderApp = () =>
  render(
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>,
  );
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  window.history.replaceState({}, "", "/");
  window.confirm = jest.fn(() => true);
  categories = [
    { _id: "cat1", name: "Coffee" },
    { _id: "cat2", name: "Cake" },
  ];
  products = [
    {
      _id: "p1",
      name: "Latte",
      price: 40000,
      category: categories[0],
      image: "",
      description: "Fresh latte",
      status: "Available",
    },
    {
      _id: "p2",
      name: "Brownie",
      price: 30000,
      category: categories[1],
      image: "",
      description: "Chocolate",
      status: "Available",
    },
  ];
  orders = [];
  users = [admin, customer];
  api.get.mockImplementation((path) => {
    if (path === "/auth/me")
      return good(JSON.parse(localStorage.getItem(SESSION_KEY)));
    if (path === "/products") return good(products);
    if (path.startsWith("/products/"))
      return good(products.find((p) => p._id === path.split("/").pop()));
    if (path === "/categories") return good(categories);
    if (path === "/orders" || path === "/orders/my") return good(orders);
    if (path === "/users") return good(users);
    throw Error(path);
  });
  api.post.mockImplementation((path, body) => {
    if (path === "/auth/login" || path === "/auth/register")
      return good(body.email === admin.email ? admin : customer);
    if (path === "/orders") {
      const order = {
        ...body,
        _id: "order1",
        createdAt: new Date().toISOString(),
        status: "Pending",
        total: 40000,
        items: body.items.map((p, i) => ({
          ...p,
          _id: `item${i}`,
          name: "Latte",
          price: 40000,
        })),
      };
      orders = [order];
      return good(order);
    }
    if (path === "/categories") {
      const c = { ...body, _id: "cat3" };
      categories = [...categories, c];
      return good(c);
    }
    if (path === "/products") {
      const p = {
        ...body,
        _id: "p3",
        category: categories.find((c) => c._id === body.category),
      };
      products = [...products, p];
      return good(p);
    }
    throw Error(path);
  });
  api.put.mockImplementation((path, body) => {
    if (path.startsWith("/products/"))
      return good({
        ...body,
        _id: path.split("/").pop(),
        category: categories.find((c) => c._id === body.category),
      });
    if (path.startsWith("/categories/"))
      return good({ ...body, _id: path.split("/").pop() });
    if (path.startsWith("/users/"))
      return good({ ...body, _id: path.split("/").pop() });
    if (path.startsWith("/orders/")) {
      orders = orders.map((o) => ({ ...o, status: body.status }));
      return good(orders[0]);
    }
    throw Error(path);
  });
  api.delete.mockImplementation(() => good({ message: "Deleted" }));
});
afterEach(cleanup);
test("customer can filter menu, log in, customize, check out and read order details", async () => {
  renderApp();
  await screen.findByRole("heading", { name: "Latte" });
  click("Cake");
  expect(
    screen.queryByRole("heading", { name: "Latte" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Brownie" })).toBeInTheDocument();
  click("All items");
  fireEvent.click(screen.getAllByRole("link", { name: "View →" })[0]);
  await screen.findByRole("heading", { name: "Latte" });
  input("Size", "Large");
  input("Anything we should know?", "First note");
  click("Log in to order");
  await screen.findByRole("heading", { name: "Your daily joy awaits." });
  input("Email", customer.email);
  input("Password", "Customer123!");
  click("Log in");
  await screen.findByRole("heading", { name: "Latte" });
  click("Add to bag · 40.000 đ");
  await screen.findByRole("heading", { name: "Your bag" });
  fireEvent.click(screen.getByRole("link", { name: "Continue to checkout →" }));
  await screen.findByRole("heading", { name: "Checkout" });
  input("Phone number", "0912345678");
  input("Delivery address", "FPT University");
  click("Place order");
  await screen.findByRole("heading", { name: "Something good is on its way." });
  expect(api.post).toHaveBeenCalledWith(
    "/orders",
    expect.objectContaining({
      customerPhone: "0912345678",
      items: [expect.objectContaining({ productId: "p1" })],
    }),
  );
  fireEvent.click(screen.getByRole("link", { name: "View my orders" }));
  await screen.findByRole("button", { name: "View details" });
  click("View details");
  expect(screen.getByText("0912345678")).toBeInTheDocument();
});
test("register rejects mismatched passwords and creates a session", async () => {
  window.history.replaceState({}, "", "/register");
  renderApp();
  await screen.findByRole("heading", { name: "Make yourself at home." });
  input("Full name", "Customer");
  input("Email", customer.email);
  input("Password (8–72 characters)", "Customer123!");
  input("Confirm password", "Different123!");
  click("Create account");
  expect(screen.getByRole("alert")).toHaveTextContent("Passwords do not match");
  expect(api.post).not.toHaveBeenCalled();
  input("Confirm password", "Customer123!");
  click("Create account");
  await screen.findByRole("heading", { name: /A fresh brew/ });
  expect(JSON.parse(localStorage.getItem(SESSION_KEY))._id).toBe(customer._id);
});
test("admin can create/edit/delete categories and products and edit users", async () => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(admin));
  window.history.replaceState({}, "", "/admin/categories");
  renderApp();
  await screen.findByRole("cell", { name: "Coffee" });
  click("+ Add category");
  input("Category name", "Specials");
  click("Save category");
  await screen.findByRole("cell", { name: "Specials" });
  let row = screen.getByRole("row", { name: /Specials/ });
  fireEvent.click(within(row).getByRole("button", { name: "Edit" }));
  input("Category name", "Specials renamed");
  click("Save category");
  await screen.findByRole("cell", { name: "Specials renamed" });
  row = screen.getByRole("row", { name: /Specials renamed/ });
  fireEvent.click(within(row).getByRole("button", { name: "Delete" }));
  await screen.findByText("Category deleted.");
  fireEvent.click(screen.getByRole("link", { name: "Products", exact: true }));
  await screen.findByRole("cell", { name: /Latte/ });
  click("+ Add product");
  input("Product name", "Cold Brew");
  input("Price (VND)", "50000");
  input("Category", "cat1");
  click("Save product");
  await screen.findByRole("cell", { name: /Cold Brew/ });
  row = screen.getByRole("row", { name: /Cold Brew/ });
  fireEvent.click(within(row).getByRole("button", { name: "Edit" }));
  input("Price (VND)", "55000");
  click("Save product");
  await screen.findByRole("cell", { name: "55.000 đ" });
  row = screen.getByRole("row", { name: /Cold Brew/ });
  fireEvent.click(within(row).getByRole("button", { name: "Delete" }));
  await screen.findByText("Product deleted.");
  fireEvent.click(screen.getByRole("link", { name: "Users", exact: true }));
  await screen.findByRole("cell", { name: customer.email });
  row = screen.getByRole("row", { name: new RegExp(customer.email) });
  fireEvent.click(within(row).getByRole("button", { name: "Edit" }));
  input("Name", "Updated Customer");
  click("Save user");
  await screen.findByRole("cell", { name: "Updated Customer" });
});
test("checkout displays server failures without clearing the cart", async () => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(customer));
  localStorage.setItem(
    "coffee_cart_customer1",
    JSON.stringify([
      {
        id: "cart1",
        productId: "p1",
        name: "Latte",
        price: 40000,
        quantity: 1,
        size: "Medium",
        sugarLevel: "50%",
        iceLevel: "Normal Ice",
        topping: "None",
        note: "",
      },
    ]),
  );
  window.history.replaceState({}, "", "/checkout");
  api.post.mockRejectedValue({
    response: { status: 500 },
    message: "Server error",
  });
  renderApp();
  await screen.findByRole("heading", { name: "Checkout" });
  input("Phone number", "0912345678");
  input("Delivery address", "FPT University");
  click("Place order");
  await screen.findByRole("alert");
  expect(screen.getByRole("alert")).toHaveTextContent("Server error");
  expect(
    JSON.parse(localStorage.getItem("coffee_cart_customer1")),
  ).toHaveLength(1);
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Place order" })).toBeEnabled(),
  );
});

test("checkout asks to review a changed price before sending an order", async () => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(customer));
  localStorage.setItem(
    "coffee_cart_customer1",
    JSON.stringify([
      {
        id: "cart1",
        productId: "p1",
        name: "Latte",
        price: 30000,
        quantity: 1,
        size: "Medium",
        sugarLevel: "50%",
        iceLevel: "Normal Ice",
        topping: "None",
        note: "",
      },
    ]),
  );
  window.history.replaceState({}, "", "/checkout");
  renderApp();
  await screen.findByRole("heading", { name: "Checkout" });
  input("Phone number", "0912345678");
  input("Delivery address", "FPT University");
  click("Place order");
  await screen.findByRole("alert");
  expect(screen.getByRole("alert")).toHaveTextContent("Prices have changed");
  expect(api.post).not.toHaveBeenCalled();
  click("Place order");
  await screen.findByRole("heading", { name: "Something good is on its way." });
  expect(api.post).toHaveBeenCalledTimes(1);
});

test("admin can confirm and complete an order and see its details", async () => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(admin));
  orders = [
    {
      _id: "order12345678",
      customerName: "Buyer",
      customerPhone: "0912345678",
      customerAddress: "FPT",
      note: "Call first",
      items: [{ _id: "item1", name: "Latte", price: 40000, quantity: 1 }],
      total: 40000,
      status: "Pending",
      createdAt: new Date().toISOString(),
    },
  ];
  window.history.replaceState({}, "", "/admin/orders");
  renderApp();
  await screen.findByRole("button", { name: "Details" });
  click("Details");
  expect(screen.getByText("Call first", { exact: false })).toBeInTheDocument();
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "Confirmed" },
  });
  await screen.findByText("Order status updated.");
  expect(screen.getByText("Confirmed", { exact: true })).toBeInTheDocument();
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "Completed" },
  });
  await waitFor(() =>
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument(),
  );
  expect(screen.getByText("Completed", { exact: true })).toBeInTheDocument();
});
