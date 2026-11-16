import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Field, Notice, Empty, money } from "../components/UI";
import api, { errorMessage } from "../services/api";
export default function Checkout() {
  const { cartItems, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const submitting = useRef(false);
  const [form, setForm] = useState({
    customerName: user.name,
    customerPhone: "",
    customerAddress: "",
    note: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(null);
  const [quoteItems, setQuoteItems] = useState(null);
  if (!cartItems.length)
    return (
      <Empty>
        Your bag is empty. <Link to="/products">Browse the menu</Link>
      </Empty>
    );
  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  async function submit(e) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await api.get("/products");
      const prices = new Map(result.data.map((p) => [p._id, p]));
      let total = 0;
      for (const item of cartItems) {
        const p = prices.get(item.productId);
        if (!p || p.status !== "Available")
          throw new Error(
            `${item.name} is unavailable. Remove it from your bag.`,
          );
        total += p.price * item.quantity;
      }
      const acceptedTotal = updated ?? getTotal();
      if (total !== acceptedTotal) {
        setUpdated(total);
        setQuoteItems(
          cartItems.map((item) => ({
            ...item,
            price: prices.get(item.productId).price,
          })),
        );
        setError(
          "Prices have changed. Review the updated total, then place your order again.",
        );
        return;
      }
      const { data } = await api.post("/orders", {
        ...form,
        items: cartItems.map(
          ({
            productId,
            quantity,
            size,
            sugarLevel,
            iceLevel,
            topping,
            note,
          }) => ({
            productId,
            quantity,
            size,
            sugarLevel,
            iceLevel,
            topping,
            note,
          }),
        ),
      });
      clearCart();
      navigate("/order-success", { replace: true, state: { order: data } });
    } catch (e) {
      setError(e.response || e.request ? errorMessage(e) : e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <div className="eyebrow">ONE MORE LITTLE STEP</div>
      <h1 className="mb-4">Checkout</h1>
      <Notice error={error} />
      <form onSubmit={submit}>
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="panel">
              <h2 className="h4 mb-4">Where should we deliver?</h2>
              <Field label="Recipient name">
                <input
                  className="form-control"
                  name="customerName"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={form.customerName}
                  onChange={change}
                />
              </Field>
              <Field label="Phone number">
                <input
                  className="form-control"
                  name="customerPhone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0912345678"
                  pattern="(0[0-9]{9}|\+84[0-9]{9})"
                  title="10 digits starting with 0, or +84 followed by 9 digits"
                  required
                  maxLength={20}
                  value={form.customerPhone}
                  onChange={change}
                />
              </Field>
              <Field label="Delivery address">
                <textarea
                  className="form-control"
                  name="customerAddress"
                  autoComplete="street-address"
                  required
                  maxLength={500}
                  value={form.customerAddress}
                  onChange={change}
                />
              </Field>
              <Field label="Delivery note (optional)">
                <textarea
                  className="form-control"
                  name="note"
                  maxLength={500}
                  value={form.note}
                  onChange={change}
                />
              </Field>
              <div className="payment-note">
                <strong>Cash on delivery</strong>
                <div className="small text-muted">
                  Pay when your order arrives. Demo orders only.
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="summary-card">
              <h2 className="h4 mb-4">Order summary</h2>
              {(quoteItems ?? cartItems).map((p) => (
                <div
                  className="d-flex justify-content-between gap-3 mb-3"
                  key={p.id}
                >
                  <span>
                    {p.name}
                    <small className="d-block text-muted">
                      {p.size} · × {p.quantity}
                    </small>
                  </span>
                  <span>{money(p.price * p.quantity)}</span>
                </div>
              ))}
              {updated !== null && (
                <p className="small">
                  Prices refreshed; the total below includes the latest menu
                  prices.
                </p>
              )}
              <hr />
              <div className="d-flex justify-content-between fs-5 fw-bold mb-4">
                <span>Total</span>
                <span>{money(updated ?? getTotal())}</span>
              </div>
              <button className="btn btn-dark w-100" disabled={busy}>
                {busy ? "Placing your order…" : "Place order"}
              </button>
              <Link to="/cart" className="d-block text-center small mt-3">
                Back to bag
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
