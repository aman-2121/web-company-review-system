import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { AuthProvider } from './context/AuthContext';

// Auth Pages
import Login from './pages/Auth/Login.tsx';
import Register from './pages/Auth/Register.tsx';
import ForgotPassword from './pages/Auth/ForgotPassword.tsx';
import ResetPassword from './pages/Auth/ResetPassword.tsx';
import ChangePassword from './pages/Auth/ChangePassword.tsx';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard.tsx';
import AdminReportedReviews from './pages/Admin/AdminReportedReviews.tsx';

// Company Pages
import CompanyDetail from './pages/Company/CompanyDetail.tsx';
import SuggestCompany from './pages/SuggestCompany.tsx';

// Main Pages
import Home from './pages/Home.tsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-gray-800 dark:text-white',
              style: {
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-color, #000)',
              },
            }}
          />

          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/suggest-company" element={<SuggestCompany />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminReportedReviews />
                </ProtectedRoute>
              }
            />


            {/* Redirect /admin to dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;