import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
const CartContext = createContext();
function readCart(id) {
  if (!id) return [];
  try {
    const value = JSON.parse(localStorage.getItem(`coffee_cart_${id}`));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function UserCart({ children, userId }) {
  const [cartItems, setCartItems] = useState(() => readCart(userId));
  function change(update) {
    setCartItems((current) => {
      const next = typeof update === "function" ? update(current) : update;
      if (userId)
        localStorage.setItem(`coffee_cart_${userId}`, JSON.stringify(next));
      return next;
    });
  }
  function addToCart(item) {
    change((current) => {
      const same = current.find((p) =>
        [
          "productId",
          "size",
          "sugarLevel",
          "iceLevel",
          "topping",
          "note",
        ].every((key) => p[key] === item[key]),
      );
      return same
        ? current.map((p) =>
            p.id === same.id
              ? { ...p, quantity: Math.min(99, p.quantity + item.quantity) }
              : p,
          )
        : [...current, { ...item, id: crypto.randomUUID() }];
    });
  }
  const removeFromCart = (id) =>
    change((current) => current.filter((item) => item.id !== id));
  function updateQuantity(id, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
    change((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }
  const getTotal = () =>
    cartItems.reduce((sum, p) => sum + p.price * p.quantity, 0);
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotal,
        clearCart: () => change([]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
export function CartProvider({ children }) {
  const { user } = useAuth();
  return (
    <UserCart key={user?._id || "guest"} userId={user?._id}>
      {children}
    </UserCart>
  );
}
export const useCart = () => useContext(CartContext);
