import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../services/api";
import { useResource, Field, Loading, Notice, Empty } from "../components/UI";
export default function AdminUsers() {
  const { user, login } = useAuth();
  const { data, setData, loading, error, setError } = useResource("/users");
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const { data: item } = await api.put(`/users/${form._id}`, {
        name: form.name,
        email: form.email,
        role: form.role,
      });
      setData((current) => current.map((u) => (u._id === item._id ? item : u)));
      if (item._id === user._id) login({ ...user, ...item });
      setForm(null);
      setSuccess("User saved.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(item) {
    if (
      !window.confirm(
        `Delete ${item.name}'s account? Order history will remain.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/users/${item._id}`);
      setData((current) => current.filter((u) => u._id !== item._id));
      if (form?._id === item._id) setForm(null);
      setSuccess("User deleted.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="section-heading">
        <h1>Users</h1>
        <span className="text-muted">{data.length} accounts</span>
      </div>
      <Notice error={error} success={success} />
      {form && (
        <form onSubmit={save} className="panel mb-4">
          <h2 className="h4">Edit user</h2>
          <Field label="Name">
            <input
              className="form-control"
              name="name"
              required
              maxLength={100}
              value={form.name}
              onChange={change}
            />
          </Field>
          <Field label="Email">
            <input
              className="form-control"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={change}
            />
          </Field>
          <Field label="Role">
            <select
              className="form-select"
              name="role"
              disabled={form._id === user._id}
              value={form.role}
              onChange={change}
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <button className="btn btn-dark me-2" disabled={busy}>
            {busy ? "Saving…" : "Save user"}
          </button>
          <button
            className="btn btn-outline-dark"
            type="button"
            disabled={busy}
            onClick={() => setForm(null)}
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((u) => (
                  <tr key={u._id}>
                    <td>
                      {u.name}
                      {u._id === user._id && (
                        <small className="text-muted"> (you)</small>
                      )}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`status ${u.role === "admin" ? "status-confirmed" : "status-pending"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="text-nowrap">
                      <button
                        className="btn btn-sm btn-outline-dark me-2"
                        disabled={busy}
                        onClick={() => {
                          setForm(u);
                          setError("");
                          setSuccess("");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        disabled={
                          busy || u._id === user._id || u.role === "admin"
                        }
                        onClick={() => remove(u)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.length && <Empty>No accounts.</Empty>}
          <p className="small text-muted mb-0">
            To delete another admin, change their role to customer first.
          </p>
        </div>
      )}
    </>
  );
}
