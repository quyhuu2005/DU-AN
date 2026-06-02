import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage        from './pages/Auth/LoginPage';
import AdminLayout      from './layouts/AdminLayout';
import DashboardPage    from './pages/Dashboard/DashboardPage';
import BranchPage       from './pages/Branch/BranchPage';
import CategoryPage     from './pages/Menu/CategoryPage';
import MasterMenuPage   from './pages/Menu/MasterMenuPage';
import EmployeePage     from './pages/HR/EmployeePage';
import BranchMenuPage   from './pages/Branch/BranchMenuPage';
import TableSetupPage   from './pages/Branch/TableSetupPage';
import POSPage          from './pages/POS/POSPage';
import KDSPage          from './pages/KDS/KDSPage';
import InventoryPage    from './pages/Inventory/InventoryPage';
import ReservationPage  from './pages/Branch/ReservationPage';
import BranchRevenuePage from './pages/Report/BranchRevenuePage';
import SystemRevenuePage from './pages/Report/SystemRevenuePage';
import OrderHistoryPage  from './pages/Report/OrderHistoryPage';
import ProtectedRoute   from './routes/ProtectedRoute';
import { ROUTES }       from './constants';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Admin (Boss / Manager) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard"  element={<DashboardPage />} />

          <Route
            path="branches"
            element={
              <ProtectedRoute allowedRoles={['BOSS']}>
                <BranchPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="categories"
            element={
              <ProtectedRoute allowedRoles={['BOSS']}>
                <CategoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="menu"
            element={
              <ProtectedRoute allowedRoles={['BOSS']}>
                <MasterMenuPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="employees"
            element={
              <ProtectedRoute allowedRoles={['BOSS', 'MANAGER']}>
                <EmployeePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="branch-menu"
            element={
              <ProtectedRoute allowedRoles={['BOSS', 'MANAGER']}>
                <BranchMenuPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="table-setup"
            element={
              <ProtectedRoute allowedRoles={['BOSS', 'MANAGER']}>
                <TableSetupPage />
              </ProtectedRoute>
            }
          />

          {/* Sprint 4: Report routes */}
          <Route
            path="report/branch"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'BOSS']}>
                <BranchRevenuePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="report/system"
            element={
              <ProtectedRoute allowedRoles={['BOSS']}>
                <SystemRevenuePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="order-history"
            element={
              <ProtectedRoute allowedRoles={['BOSS', 'MANAGER']}>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="inventory"
            element={
              <ProtectedRoute allowedRoles={['BOSS', 'MANAGER']}>
                <InventoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="reservations"
            element={
              <ProtectedRoute allowedRoles={['BOSS', 'MANAGER']}>
                <ReservationPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* POS (Staff/Manager/Boss) */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'MANAGER', 'BOSS']}>
              <POSPage />
            </ProtectedRoute>
          }
        />

        {/* KDS (Chef/Manager/Boss) */}
        <Route
          path="/kds"
          element={
            <ProtectedRoute allowedRoles={['CHEF', 'MANAGER', 'BOSS']}>
              <KDSPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
