import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { connectSocket } from './utils/socket';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PaymentPortal from './pages/payment/PaymentPortal';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminOverview from './pages/Admin/AdminOverview';
import AdminMerchants from './pages/Admin/AdminMerchants';
import AdminInvoices from './pages/Admin/AdminInvoices';
import AdminSupport from './pages/Admin/AdminSupport';
import AdminSystem from './pages/Admin/AdminSystem';
import AdminFlags from './pages/Admin/AdminFlags';
import AdminAudit from './pages/Admin/AdminAudit';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (!token) {
      import('./utils/socket').then(m => m.disconnectSocket());
    } else {
      import('./utils/socket').then(m => m.connectSocket(token));
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/pay/:invoiceNum" element={<PaymentPortal />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="merchants" element={<AdminMerchants />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="system" element={<AdminSystem />} />
        <Route path="flags" element={<AdminFlags />} />
        <Route path="audit" element={<AdminAudit />} />
      </Route>
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}

export default App
