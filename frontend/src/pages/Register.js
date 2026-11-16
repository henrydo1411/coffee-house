import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../services/api";
import { Field, Notice, Loading } from "../components/UI";
export default function Register() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (loading) return <Loading />;
  if (user) return <Navigate to="/" replace />;
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(data);
      navigate("/", { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-card">
      <div className="eyebrow">JOIN OUR LITTLE COFFEE CLUB</div>
      <h1 className="h2">Make yourself at home.</h1>
      <p className="text-muted">A few details, then something delicious.</p>
      <Notice error={error} />
      <form onSubmit={submit}>
        <Field label="Full name">
          <input
            className="form-control"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            value={form.name}
            onChange={change}
          />
        </Field>
        <Field label="Email">
          <input
            className="form-control"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={change}
          />
        </Field>
        <Field label="Password (8–72 characters)">
          <input
            className="form-control"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={form.password}
            onChange={change}
          />
        </Field>
        <Field label="Confirm password">
          <input
            className="form-control"
            type="password"
            name="confirm"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={form.confirm}
            onChange={change}
          />
        </Field>
        <button className="btn btn-dark w-100" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 mb-0 text-center small">
        Already a member? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
