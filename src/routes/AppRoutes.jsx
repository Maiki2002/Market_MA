import { NavLink, Outlet } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import Principal from "../pages/Principal";
import Productos from "../pages/Productos";
import Departamentos from "../pages/Departamentos";
import Precios from "../pages/Precios";
import AsignarProductos from "../pages/AsignarProducto";

const sidebarLinks = [
  { to: "/app", label: "Inicio", icon: HomeIcon, end: true },
  { to: "/app/productos", label: "Productos", icon: Inventory2Icon },
  { to: "/app/departamentos", label: "Departamentos", icon: ApartmentIcon },
  { to: "/app/asignar", label: "Asignar Productos", icon: DesignServicesIcon },
  { to: "/app/precios", label: "Precios", icon: AttachMoneyIcon },

];

function SidebarLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="sidebar__title">Market MA</h1>
        <p className="sidebar__subtitle">Panel de gestion</p>
        <nav className="sidebar__nav">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                }
              >
                <Icon className="sidebar__icon" fontSize="small" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export const appRouteTree = {
  path: "/app",
  element: <SidebarLayout />,
  children: [
    { index: true, element: <Principal /> },
    { path: "productos", element: <Productos /> },
    { path: "departamentos", element: <Departamentos /> },
    { path: "asignar", element: <AsignarProductos/> },
    { path: "precios", element: <Precios /> },
  ],
};
