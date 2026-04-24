import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/Auth";
import Order from "./pages/Order/Order";
import ClientDashboard from "./pages/ClientDashboard/ClientDashboard";
import ConfectionerDashboard from "./pages/ConfectionerDashboard/ConfectionerDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/order" element={<Order />} />
      <Route path="/client" element={<ClientDashboard />} />
      <Route path="/confectioner" element={<ConfectionerDashboard />} />
    </Routes>
  );
}