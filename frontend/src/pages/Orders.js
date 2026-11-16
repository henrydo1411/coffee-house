import { useState } from "react";
import { Link } from "react-router-dom";
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
export default function Orders() {
  const { data, loading, error, reload } = useResource("/orders/my");
  const [selected, setSelected] = useState(null);
  return (
    <>
      <div className="section-heading">
        <div>
          <div className="eyebrow">YOUR COFFEE JOURNEY</div>
          <h1>My orders</h1>
        </div>
        <button className="btn btn-outline-dark" onClick={reload}>
          Refresh
        </button>
      </div>
      <Notice error={error} />
      {loading ? (
        <Loading />
      ) : !data.length ? (
        <Empty>
          No orders yet. <Link to="/products">Find your first favorite →</Link>
        </Empty>
      ) : (
        data.map((order) => (
          <article className="panel mb-3" key={order._id}>
            <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
              <div>
                <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                <div className="small text-muted">{date(order.createdAt)}</div>
              </div>
              <Status value={order.status} />
              <strong>{money(order.total)}</strong>
              <button
                className="btn btn-sm btn-outline-dark"
                onClick={() =>
                  setSelected(selected === order._id ? null : order._id)
                }
              >
                {selected === order._id ? "Hide details" : "View details"}
              </button>
            </div>
            {selected === order._id && <OrderDetails order={order} />}
          </article>
        ))
      )}
    </>
  );
}
