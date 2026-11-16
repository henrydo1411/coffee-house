import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CartProvider, useCart } from "./CartContext";
let mockUser = { _id: "a" };
jest.mock("./AuthContext", () => ({ useAuth: () => ({ user: mockUser }) }));
const base = {
  productId: "product1",
  name: "Latte",
  price: 40000,
  quantity: 1,
  size: "Medium",
  sugarLevel: "50%",
  iceLevel: "Normal Ice",
  topping: "None",
  note: "First",
};
function Consumer() {
  const { cartItems, addToCart, updateQuantity, clearCart, getTotal } =
    useCart();
  return (
    <>
      <output data-testid="cart">{JSON.stringify(cartItems)}</output>
      <output data-testid="total">{getTotal()}</output>
      <button onClick={() => addToCart(base)}>Add</button>
      <button onClick={() => addToCart({ ...base, note: "Other" })}>
        Other note
      </button>
      <button onClick={() => updateQuantity(cartItems[0].id, 2)}>
        Quantity
      </button>
      <button onClick={clearCart}>Clear</button>
    </>
  );
}
beforeEach(() => {
  localStorage.clear();
  mockUser = { _id: "a" };
  let id = 0;
  global.crypto.randomUUID = () => `cart-${++id}`;
});
afterEach(cleanup);
const items = () => JSON.parse(screen.getByTestId("cart").textContent);
test("identical options merge while different notes remain separate", () => {
  render(
    <CartProvider>
      <Consumer />
    </CartProvider>,
  );
  fireEvent.click(screen.getByText("Add"));
  fireEvent.click(screen.getByText("Add"));
  expect(items()).toHaveLength(1);
  expect(items()[0].quantity).toBe(2);
  fireEvent.click(screen.getByText("Other note"));
  expect(items()).toHaveLength(2);
  expect(screen.getByTestId("total")).toHaveTextContent("120000");
});
test("changing accounts never copies the previous account's cart", () => {
  const { rerender } = render(
    <CartProvider>
      <Consumer />
    </CartProvider>,
  );
  fireEvent.click(screen.getByText("Add"));
  mockUser = { _id: "b" };
  rerender(
    <CartProvider>
      <Consumer />
    </CartProvider>,
  );
  expect(items()).toHaveLength(0);
  fireEvent.click(screen.getByText("Other note"));
  mockUser = null;
  rerender(
    <CartProvider>
      <Consumer />
    </CartProvider>,
  );
  expect(items()).toHaveLength(0);
  mockUser = { _id: "a" };
  rerender(
    <CartProvider>
      <Consumer />
    </CartProvider>,
  );
  expect(items()).toHaveLength(1);
  expect(items()[0].note).toBe("First");
  expect(JSON.parse(localStorage.getItem("coffee_cart_b"))[0].note).toBe(
    "Other",
  );
});
test("quantity and clear persist after remount", () => {
  const view = render(
    <CartProvider>
      <Consumer />
    </CartProvider>,
  );
  fireEvent.click(screen.getByText("Add"));
  fireEvent.click(screen.getByText("Quantity"));
  view.unmount();
  render(
    <CartProvider>
      <Consumer />
    </CartProvider>,
  );
  expect(items()[0].quantity).toBe(2);
  fireEvent.click(screen.getByText("Clear"));
  expect(items()).toHaveLength(0);
  expect(localStorage.getItem("coffee_cart_a")).toBe("[]");
});
