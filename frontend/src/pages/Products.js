import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { useResource, Loading, Notice, Empty } from "../components/UI";
export function Menu({ compact = false }) {
  const products = useResource("/products");
  const categories = useResource("/categories");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const filtered = products.data.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase().trim()) &&
      (!category || p.category?._id === category),
  );
  return (
    <section id="menu" className="menu-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">FIND YOUR FAVORITE</div>
          <h2>{compact ? "Something for every mood." : "Our menu"}</h2>
        </div>
        <span className="text-muted">Freshly made, thoughtfully served.</span>
      </div>
      <div className="menu-toolbar">
        <div className="category-pills">
          <button
            className={!category ? "selected" : ""}
            onClick={() => setCategory("")}
          >
            All items
          </button>
          {categories.data.map((c) => (
            <button
              key={c._id}
              className={category === c._id ? "selected" : ""}
              onClick={() => setCategory(c._id)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <input
          className="form-control search-input"
          aria-label="Search products"
          placeholder="Search your next favorite…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Notice error={products.error || categories.error} />
      {(products.error || categories.error) && (
        <button
          className="btn btn-outline-dark mb-3"
          onClick={() => {
            products.reload();
            categories.reload();
          }}
        >
          Try again
        </button>
      )}
      {products.loading || categories.loading ? (
        <Loading />
      ) : (
        <>
          <div className="row g-4">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {!filtered.length && !products.error && (
            <Empty>No drinks found. Try another search or category.</Empty>
          )}
        </>
      )}
    </section>
  );
}
export default function Products() {
  return <Menu />;
}
