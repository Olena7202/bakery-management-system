import { Navigate, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/Auth";
import Order from "./pages/Order/Order";
import ClientDashboard from "./pages/ClientDashboard/ClientDashboard";
import ConfectionerDashboard from "./pages/ConfectionerDashboard/ConfectionerDashboard";
import ClientSettings from "./pages/ClientSettings/ClientSettings";
import ConfectionerSettings from "./pages/ConfectionerSettings/ConfectionerSettings";
import ClientCabinetLayout from "./layouts/ClientCabinetLayout";
import ConfectionerCabinetLayout from "./layouts/ConfectionerCabinetLayout";
import RequireAuth from "./components/RequireAuth";
import { getCurrentUser, getDashboardPathByRole } from "./services/authStorage";

export default function App() {
  const currentUser = getCurrentUser();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/auth"
        element={
          currentUser ? <Navigate to={getDashboardPathByRole(currentUser.role)} replace /> : <Auth />
        }
      />
      <Route path="/order" element={<Order />} />
      <Route
        path="/client"
        element={
          <RequireAuth allowedRole="client">
            <ClientCabinetLayout />
          </RequireAuth>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="settings" element={<ClientSettings />} />
      </Route>
      <Route
        path="/confectioner"
        element={
          <RequireAuth allowedRole="confectioner">
            <ConfectionerCabinetLayout />
          </RequireAuth>
        }
      >
        <Route index element={<ConfectionerDashboard />} />
        <Route path="settings" element={<ConfectionerSettings />} />
      </Route>
    </Routes>
  );
}
