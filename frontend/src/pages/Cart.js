import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Empty, Photo, money } from "../components/UI";
export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotal } = useCart();
  return (
    <>
      <div className="section-heading">
        <div>
          <div className="eyebrow">A LITTLE SOMETHING FOR YOU</div>
          <h1>Your bag</h1>
        </div>
        <Link to="/products">Keep exploring →</Link>
      </div>
      {!cartItems.length ? (
        <Empty>
          <h3>Your bag is waiting for something good.</h3>
          <Link to="/products" className="btn btn-dark mt-3">
            Explore our menu
          </Link>
        </Empty>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.id}>
                <Link to={`/products/${item.productId}`}>
                  <Photo
                    src={item.image}
                    alt={item.name}
                    className="cart-photo"
                  />
                </Link>
                <div className="flex-grow-1">
                  <Link
                    className="h5 d-block"
                    to={`/products/${item.productId}`}
                  >
                    {item.name}
                  </Link>
                  <p className="small text-muted mb-1">
                    {[
                      item.size,
                      `${item.sugarLevel} sugar`,
                      item.iceLevel,
                      item.topping,
                    ].join(" · ")}
                  </p>
                  {item.note && <p className="small mb-1">Note: {item.note}</p>}
                  <strong>{money(item.price)}</strong>
                  <div className="d-flex gap-3 mt-3 align-items-center">
                    <div className="quantity-control">
                      <button
                        aria-label={`Decrease ${item.name}`}
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        aria-label={`Increase ${item.name}`}
                        disabled={item.quantity >= 99}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="btn btn-link btn-sm text-danger"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <strong className="text-nowrap">
                  {money(item.price * item.quantity)}
                </strong>
              </article>
            ))}
          </div>
          <div className="col-lg-4">
            <div className="summary-card">
              <h3 className="h4">Your little treats</h3>
              <div className="d-flex justify-content-between py-3">
                <span>Subtotal</span>
                <strong>{money(getTotal())}</strong>
              </div>
              <p className="small text-muted">
                No delivery fee in this demo. Final prices are checked when you
                place your order.
              </p>
              <Link to="/checkout" className="btn btn-dark w-100">
                Continue to checkout →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
