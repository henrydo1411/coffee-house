import { useState } from "react";
import api, { errorMessage } from "../services/api";
import { useResource, Field, Loading, Notice, Empty } from "../components/UI";
export default function AdminCategories() {
  const resource = useResource("/categories");
  const { data, setData, loading, error, setError } = resource;
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  function edit(category) {
    setEditing(category || {});
    setName(category?.name || "");
    setError("");
    setSuccess("");
  }
  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const { data: item } = editing._id
        ? await api.put(`/categories/${editing._id}`, { name })
        : await api.post("/categories", { name });
      setData((current) =>
        editing._id
          ? current.map((c) => (c._id === item._id ? item : c))
          : [...current, item],
      );
      setEditing(null);
      setSuccess("Category saved.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(category) {
    if (
      !window.confirm(
        `Delete ${category.name}? Categories containing products cannot be deleted.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/categories/${category._id}`);
      setData((current) => current.filter((c) => c._id !== category._id));
      setSuccess("Category deleted.");
      if (editing?._id === category._id) setEditing(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="section-heading">
        <h1>Categories</h1>
        <button
          className="btn btn-dark"
          disabled={busy}
          onClick={() => edit(null)}
        >
          + Add category
        </button>
      </div>
      <Notice error={error} success={success} />
      {editing && (
        <form className="panel mb-4" onSubmit={save}>
          <h2 className="h4">
            {editing._id ? "Edit category" : "New category"}
          </h2>
          <Field label="Category name">
            <input
              autoFocus
              className="form-control"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <button className="btn btn-dark me-2" disabled={busy}>
            {busy ? "Saving…" : "Save category"}
          </button>
          <button
            type="button"
            className="btn btn-outline-dark"
            disabled={busy}
            onClick={() => setEditing(null)}
          >
            Cancel
          </button>
        </form>
      )}
      {loading ? (
        <Loading />
      ) : (
        <div className="panel">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c, i) => (
                  <tr key={c._id}>
                    <td>{i + 1}</td>
                    <td>{c.name}</td>
                    <td className="text-end text-nowrap">
                      <button
                        className="btn btn-sm btn-outline-dark me-2"
                        disabled={busy}
                        onClick={() => edit(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        disabled={busy}
                        onClick={() => remove(c)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.length && <Empty>No categories yet.</Empty>}
        </div>
      )}
    </>
  );
}
