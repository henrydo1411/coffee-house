import { useState } from "react";
import api, { errorMessage } from "../services/api";
import {
  useResource,
  Field,
  Loading,
  Notice,
  Empty,
  Photo,
  money,
  Status,
} from "../components/UI";
const blank = {
  name: "",
  price: "",
  description: "",
  image: "",
  category: "",
  status: "Available",
};
export default function AdminProducts() {
  const resource = useResource("/products");
  const categories = useResource("/categories");
  const { data, setData, loading, error, setError } = resource;
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  function edit(product) {
    setForm(
      product
        ? { ...product, category: product.category?._id || "" }
        : { ...blank },
    );
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSuccess("");
    const body = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      description: form.description,
      image: form.image,
      status: form.status,
    };
    try {
      const { data: item } = form._id
        ? await api.put(`/products/${form._id}`, body)
        : await api.post("/products", body);
      setData((current) =>
        form._id
          ? current.map((p) => (p._id === item._id ? item : p))
          : [item, ...current],
      );
      setForm(null);
      setSuccess("Product saved.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(product) {
    if (
      !window.confirm(
        `Delete ${product.name}? Existing order history will be preserved.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/products/${product._id}`);
      setData((current) => current.filter((p) => p._id !== product._id));
      setSuccess("Product deleted.");
      if (form?._id === product._id) setForm(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="section-heading">
        <h1>Products</h1>
        <button
          className="btn btn-dark"
          disabled={busy}
          onClick={() => edit(null)}
        >
          + Add product
        </button>
      </div>
      <Notice error={error || categories.error} success={success} />
      {form && (
        <form onSubmit={save} className="panel mb-4">
          <h2 className="h4 mb-3">
            {form._id ? "Edit product" : "New product"}
          </h2>
          <div className="row">
            <div className="col-md-7">
              <Field label="Product name">
                <input
                  className="form-control"
                  name="name"
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={change}
                />
              </Field>
            </div>
            <div className="col-md-5">
              <Field label="Price (VND)">
                <input
                  className="form-control"
                  name="price"
                  type="number"
                  min={1}
                  max={100000000}
                  required
                  value={form.price}
                  onChange={change}
                />
              </Field>
            </div>
            <div className="col-md-7">
              <Field label="Category">
                <select
                  className="form-select"
                  name="category"
                  required
                  value={form.category}
                  onChange={change}
                >
                  <option value="">Select a category</option>
                  {categories.data.map((c) => (
                    <option value={c._id} key={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="col-md-5">
              <Field label="Availability">
                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={change}
                >
                  <option>Available</option>
                  <option>Unavailable</option>
                </select>
              </Field>
            </div>
          </div>
          {!categories.data.length && (
            <p className="text-muted">
              Create a category first in the Categories tab.
            </p>
          )}
          <Field label="Description">
            <textarea
              className="form-control"
              name="description"
              maxLength={3000}
              value={form.description}
              onChange={change}
            />
          </Field>
          <Field label="Image URL (http or https, optional)">
            <input
              className="form-control"
              name="image"
              type="url"
              maxLength={2000}
              value={form.image}
              onChange={change}
            />
          </Field>
          <button
            className="btn btn-dark me-2"
            disabled={busy || !categories.data.length}
          >
            {busy ? "Saving…" : "Save product"}
          </button>
          <button
            type="button"
            className="btn btn-outline-dark"
            disabled={busy}
            onClick={() => setForm(null)}
          >
            Cancel
          </button>
        </form>
      )}
      <input
        className="form-control mb-3"
        aria-label="Search products"
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <Loading />
      ) : (
        <div className="panel">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .filter((p) =>
                    p.name.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="d-flex gap-2 align-items-center">
                          <Photo
                            className="table-photo"
                            src={p.image}
                            alt={p.name}
                          />
                          <strong>{p.name}</strong>
                        </div>
                      </td>
                      <td>{p.category?.name || "Unassigned"}</td>
                      <td className="text-nowrap">{money(p.price)}</td>
                      <td>
                        <Status value={p.status} />
                      </td>
                      <td className="text-nowrap">
                        <button
                          className="btn btn-sm btn-outline-dark me-2"
                          disabled={busy}
                          onClick={() => edit(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={busy}
                          onClick={() => remove(p)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {!data.length && <Empty>Your menu is empty.</Empty>}
        </div>
      )}
    </>
  );
}
