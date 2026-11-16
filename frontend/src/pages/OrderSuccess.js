import { Link, useLocation } from "react-router-dom";
import { money } from "../components/UI";
export default function OrderSuccess() {
  const order = useLocation().state?.order;
  return (
    <div className="success-card">
      <div className="success-icon">✓</div>
      <div className="eyebrow">THANK YOU FOR YOUR ORDER</div>
      <h1>
        {order ? "Something good is on its way." : "Your coffee moments."}
      </h1>
      <p className="text-muted">
        {order
          ? "Your order has been received. Follow its progress in My orders."
          : "Check My orders to see the latest status of your purchases."}
      </p>
      {order && (
        <p>
          Order #{order._id.slice(-8).toUpperCase()} ·{" "}
          <strong>{money(order.total)}</strong>
        </p>
      )}
      <Link className="btn btn-dark me-2" to="/orders">
        View my orders
      </Link>
      <Link className="btn btn-outline-dark" to="/products">
        Back to menu
      </Link>
    </div>
  );
}
