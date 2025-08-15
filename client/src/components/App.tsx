import React from 'react';

import { Toaster } from 'react-hot-toast';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import Navbar from './components/Navbar.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import AdminDashboard from './pages/Admin/AdminDashboard.tsx';
import AdminReportedReviews from './pages/Admin/AdminReportedReviews.tsx';
import Login from './pages/Auth/Login.tsx';
import Register from './pages/Auth/Register.tsx';
import CompanyDetail from './pages/Company/CompanyDetail.tsx';
// Pages
import Home from './pages/Home.tsx';
import SuggestCompany from './pages/SuggestCompany.tsx';

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