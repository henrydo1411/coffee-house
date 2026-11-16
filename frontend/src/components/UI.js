import { useEffect, useState } from "react";
import api, { errorMessage } from "../services/api";
export const money = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;
export const date = (value) => new Date(value).toLocaleString("vi-VN");
export function Loading() {
  return (
    <div className="empty-state" role="status">
      <span className="spinner-border spinner-border-sm me-2" />
      Preparing your coffee…
    </div>
  );
}
export function Notice({ error, success }) {
  return (
    <>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}
    </>
  );
}
export function Empty({ children }) {
  return <div className="empty-state">{children}</div>;
}
export function Photo({ src, alt, className = "", ...props }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  ) : (
    <div
      className={`photo-placeholder ${className}`}
      role="img"
      aria-label={alt}
    >
      ☕
    </div>
  );
}
export function Status({ value }) {
  return (
    <span className={`status status-${value.toLowerCase()}`}>{value}</span>
  );
}
export function useResource(path) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get(path)
      .then((response) => {
        if (active) setData(response.data);
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
  }, [path, revision]);
  return {
    data,
    setData,
    loading,
    error,
    setError,
    reload: () => setRevision((n) => n + 1),
  };
}
export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function OrderDetails({ order }) {
  return (
    <div className="order-detail">
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <strong>{order.customerName}</strong>
          <div>{order.customerPhone}</div>
          <div>{order.customerAddress}</div>
        </div>
        <div className="col-md-6">
          <div>Payment: Cash on delivery</div>
          <div>Placed: {date(order.createdAt)}</div>
          {order.note && <div>Note: {order.note}</div>}
        </div>
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Item</th>
              <th>Options</th>
              <th>Qty</th>
              <th className="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.name}</strong>
                  <div className="small text-muted">{money(item.price)}</div>
                </td>
                <td className="small">
                  {[
                    item.size,
                    item.sugarLevel && `${item.sugarLevel} sugar`,
                    item.iceLevel,
                    item.topping,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  {item.note && <div>Note: {item.note}</div>}
                </td>
                <td>{item.quantity}</td>
                <td className="text-end">
                  {money(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-end fw-bold fs-5">Total: {money(order.total)}</div>
    </div>
  );
}
