import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductsAdmin from "./pages/ProductsAdmin";
import CustomersAdmin from "./pages/CustomersAdmin";
import SalesOverview from "./pages/SalesOverview";
import Orders from "./pages/Orders";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Predictions from "./pages/Predictions";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ─────────────────────────────────── */}
          <Route path="/login" element={<Login />} />

          {/* ── Protected — any authenticated user ─────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<ProductsAdmin />} />
              <Route path="/customers" element={<CustomersAdmin />} />
              <Route path="/sales" element={<SalesOverview />} />
              <Route path="/sales/orders" element={<Orders />} />
              <Route path="/sales/transactions" element={<Transactions />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/recommendations" element={<Recommendations />} />
            </Route>
          </Route>

          {/* ── Unknown routes ──────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;