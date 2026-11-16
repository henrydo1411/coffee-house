import { useState } from "react";
import api, { errorMessage } from "../services/api";
import {
  useResource,
  Loading,
  Notice,
  Empty,
  Status,
  OrderDetails,
  money,
  date,
} from "../components/UI";
const transitions = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};
export default function AdminOrders() {
  const { data, setData, loading, error, setError, reload } =
    useResource("/orders");
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  async function update(order, status) {
    if (
      !window.confirm(
        `Change order #${order._id.slice(-8).toUpperCase()} to ${status}?`,
      )
    )
      return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const { data: item } = await api.put(`/orders/${order._id}/status`, {
        status,
      });
      setData((current) => current.map((o) => (o._id === item._id ? item : o)));
      setSuccess("Order status updated.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const detail = data.find((o) => o._id === selected);
  const filtered = data.filter((o) => !filter || o.status === filter);
  return (
    <>
      <div className="section-heading">
        <h1>Orders</h1>
        <button
          className="btn btn-outline-dark"
          disabled={busy}
          onClick={reload}
        >
          Refresh
        </button>
      </div>
      <Notice error={error} success={success} />
      <div className="category-pills mb-4">
        {["", "Pending", "Confirmed", "Completed", "Cancelled"].map((s) => (
          <button
            key={s}
            className={filter === s ? "selected" : ""}
            onClick={() => setFilter(s)}
          >
            {s || "All"} ({data.filter((o) => !s || o.status === s).length})
          </button>
        ))}
      </div>
      {detail && (
        <section className="panel mb-4">
          <div className="d-flex justify-content-between">
            <h2 className="h4">Order #{detail._id.slice(-8).toUpperCase()}</h2>
            <button
              className="btn btn-sm btn-outline-dark"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
          <OrderDetails order={detail} />
        </section>
      )}
      {loading ? (
        <Loading />
      ) : (
        <div className="panel">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Order / Customer</th>
                  <th>Placed</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <strong>#{o._id.slice(-8).toUpperCase()}</strong>
                      <div>{o.customerName}</div>
                      <small className="text-muted">{o.customerPhone}</small>
                    </td>
                    <td className="small">{date(o.createdAt)}</td>
                    <td className="text-nowrap">{money(o.total)}</td>
                    <td>
                      <Status value={o.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-dark mb-2"
                        onClick={() => setSelected(o._id)}
                      >
                        Details
                      </button>
                      {transitions[o.status]?.length > 0 && (
                        <select
                          className="form-select form-select-sm"
                          aria-label={`Change order ${o._id} status`}
                          value=""
                          disabled={busy}
                          onChange={(e) => update(o, e.target.value)}
                        >
                          <option value="">Update status…</option>
                          {transitions[o.status].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filtered.length && <Empty>No orders in this group.</Empty>}
        </div>
      )}
    </>
  );
}
