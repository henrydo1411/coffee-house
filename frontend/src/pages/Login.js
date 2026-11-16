import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../services/api";
import { Field, Notice, Loading } from "../components/UI";
export default function Login() {
  const { user, login, loading, sessionError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (loading) return <Loading />;
  if (user)
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
      const from = location.state?.from;
      navigate(
        from?.startsWith("/") && !from.startsWith("//")
          ? from
          : data.role === "admin"
            ? "/admin"
            : "/",
        { replace: true },
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-card">
      <div className="eyebrow">WELCOME BACK</div>
      <h1 className="h2">Your daily joy awaits.</h1>
      <p className="text-muted">
        Log in to save your bag and track your orders.
      </p>
      <Notice error={error || sessionError} />
      <form onSubmit={submit}>
        <Field label="Email">
          <input
            className="form-control"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password">
          <input
            className="form-control"
            type="password"
            autoComplete="current-password"
            required
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <button className="btn btn-dark w-100" disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 mb-0 text-center small">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
