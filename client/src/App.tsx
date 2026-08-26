import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ProductsAdmin from "./pages/ProductsAdmin";
import CustomersAdmin from "./pages/CustomersAdmin";
import SalesOverview from "./pages/SalesOverview";
import Orders from "./pages/Orders";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* Products */}
        <Route
          path="/products"
          element={<ProductsAdmin />}
        />

        {/* Customers */}
        <Route
          path="/customers"
          element={<CustomersAdmin />}
        />

        {/* Sales Overview */}
        <Route
          path="/sales"
          element={<SalesOverview />}
        />

        {/* Orders */}
        <Route
          path="/sales/orders"
          element={<Orders />}
        />

        {/* Transactions - inside Sales */}
        <Route
          path="/sales/transactions"
          element={<Transactions />}
        />

        {/* Transactions - direct URL */}
        <Route
          path="/transactions"
          element={<Transactions />}
        />

        <Route
  path="/analytics"
  element={<Analytics />}
/>


<Route
  path="/reports"
  element={<Reports />}
/>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;