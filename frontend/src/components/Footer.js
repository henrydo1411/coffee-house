import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container d-flex flex-wrap justify-content-between gap-3">
        <div>
          <strong>COFFEE HOUSE</strong>
          <p className="small mb-0">
            Good coffee. A little moment for yourself.
          </p>
        </div>
        <div className="small">
          <Link to="/products">Explore the menu →</Link>
          <div className="mt-1 text-muted">
            Internship demo · Orders are for demonstration
          </div>
        </div>
      </div>
    </footer>
  );
}
