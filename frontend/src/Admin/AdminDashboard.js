import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../services/api";
import { Loading, Notice, money, Status, date } from "../components/UI";
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([api.get("/products"), api.get("/orders"), api.get("/users")])
      .then(([p, o, u]) => {
        if (active)
          setData({ products: p.data, orders: o.data, users: u.data });
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, []);
  if (error) return <Notice error={error} />;
  if (!data) return <Loading />;
  const cards = [
    [
      "Completed revenue",
      money(
        data.orders
          .filter((o) => o.status === "Completed")
          .reduce((sum, o) => sum + o.total, 0),
      ),
      "/admin/orders",
    ],
    [
      "Pending orders",
      data.orders.filter((o) => o.status === "Pending").length,
      "/admin/orders",
    ],
    ["Menu items", data.products.length, "/admin/products"],
    ["Registered users", data.users.length, "/admin/users"],
  ];
  return (
    <>
      <div className="eyebrow">A FRESH START</div>
      <h1 className="mb-4">Your shop at a glance.</h1>
      <div className="row g-3 mb-4">
        {cards.map(([label, value, url]) => (
          <div className="col-sm-6" key={label}>
            <Link to={url} className="stat-card">
              <span>{label}</span>
              <strong>{value}</strong>
              <small>View details ↗</small>
            </Link>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="d-flex justify-content-between mb-3">
          <h2 className="h4">Latest orders</h2>
          <Link to="/admin/orders">View all →</Link>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Placed</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.slice(0, 5).map((o) => (
                <tr key={o._id}>
                  <td>{o.customerName}</td>
                  <td>{date(o.createdAt)}</td>
                  <td>{money(o.total)}</td>
                  <td>
                    <Status value={o.status} />
                  </td>
                </tr>
              ))}
              {!data.orders.length && (
                <tr>
                  <td colSpan={4}>Your first order will appear here.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
