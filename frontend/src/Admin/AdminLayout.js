import { NavLink, Outlet } from "react-router-dom";
export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="eyebrow">THE COFFEE DESK</div>
        <h2 className="h4 mb-4">Workspace</h2>
        <nav aria-label="Admin navigation">
          {[
            ["/admin", "Overview"],
            ["/admin/products", "Products"],
            ["/admin/categories", "Categories"],
            ["/admin/orders", "Orders"],
            ["/admin/users", "Users"],
          ].map(([path, label]) => (
            <NavLink key={path} to={path} end={path === "/admin"}>
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="small text-muted mt-4">
          Keep the menu fresh.
          <br />
          Make every order count.
        </p>
      </aside>
      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  );
}
