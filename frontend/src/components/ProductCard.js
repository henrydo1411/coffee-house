import { Link } from "react-router-dom";
import { Photo, money } from "./UI";
export default function ProductCard({ product }) {
  return (
    <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
      <article className="product-card">
        <Link to={`/products/${product._id}`} className="product-photo-link">
          <Photo
            src={product.image}
            alt={product.name}
            className="product-photo"
          />
          {product.status === "Unavailable" && (
            <span className="sold-out">Unavailable</span>
          )}
        </Link>
        <div className="p-3">
          <div className="eyebrow mb-2">
            {product.category?.name || "Our selection"}
          </div>
          <h3 className="h5">
            <Link to={`/products/${product._id}`}>{product.name}</Link>
          </h3>
          <p className="product-description">
            {product.description || "Made with care, just for you."}
          </p>
          <div className="d-flex align-items-center justify-content-between">
            <strong>{money(product.price)}</strong>
            <Link
              className="btn btn-sm btn-outline-dark"
              to={`/products/${product._id}`}
            >
              View →
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
