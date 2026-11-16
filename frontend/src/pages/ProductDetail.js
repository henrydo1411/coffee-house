import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Field, Loading, Notice, Photo, money } from "../components/UI";
import api, { errorMessage } from "../services/api";
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    size: "Medium",
    sugarLevel: "50%",
    iceLevel: "Normal Ice",
    topping: "None",
    note: "",
    quantity: 1,
  });
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        if (active) setProduct(data);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (loading) return <Loading />;
  if (error || !product)
    return (
      <>
        <Notice error={error || "Product not found"} />
        <Link to="/products">Back to menu</Link>
      </>
    );
  function add(e) {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      ...options,
      note: options.note.trim(),
    });
    navigate("/cart");
  }
  return (
    <>
      <Link className="back-link" to="/products">
        ← Back to menu
      </Link>
      <div className="row g-5 align-items-start">
        <div className="col-lg-6">
          <Photo
            className="detail-photo"
            src={product.image}
            alt={product.name}
          />
        </div>
        <div className="col-lg-6">
          <div className="eyebrow">
            {product.category?.name || "OUR SELECTION"}
          </div>
          <h1 className="mt-2">{product.name}</h1>
          <p className="fs-4 accent-text fw-bold">{money(product.price)}</p>
          <p className="text-muted">{product.description}</p>
          {product.status === "Unavailable" && (
            <Notice error="This item is currently unavailable." />
          )}
          <form onSubmit={add}>
            <div className="row">
              {Object.entries({
                size: ["Small", "Medium", "Large"],
                sugarLevel: ["0%", "50%", "100%"],
                iceLevel: ["No Ice", "Less Ice", "Normal Ice"],
                topping: ["None", "Pearl", "Cream"],
              }).map(([key, values]) => (
                <div className="col-6" key={key}>
                  <Field
                    label={
                      {
                        size: "Size",
                        sugarLevel: "Sweetness",
                        iceLevel: "Ice",
                        topping: "Topping",
                      }[key]
                    }
                  >
                    <select
                      className="form-select"
                      value={options[key]}
                      onChange={(e) =>
                        setOptions({ ...options, [key]: e.target.value })
                      }
                    >
                      {values.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              ))}
            </div>
            <p className="small text-muted">
              All sizes and toppings currently use the listed price.
            </p>
            <Field label="Anything we should know?">
              <textarea
                className="form-control"
                placeholder="Your preferences (optional)"
                maxLength={300}
                value={options.note}
                onChange={(e) =>
                  setOptions({ ...options, note: e.target.value })
                }
              />
            </Field>
            <div className="d-flex gap-3 align-items-center">
              <div className="quantity-control">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={options.quantity <= 1}
                  onClick={() =>
                    setOptions({ ...options, quantity: options.quantity - 1 })
                  }
                >
                  −
                </button>
                <span>{options.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={options.quantity >= 99}
                  onClick={() =>
                    setOptions({ ...options, quantity: options.quantity + 1 })
                  }
                >
                  +
                </button>
              </div>
              <button
                className="btn btn-dark flex-grow-1"
                disabled={product.status !== "Available"}
              >
                {user
                  ? `Add to bag · ${money(product.price * options.quantity)}`
                  : "Log in to order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
