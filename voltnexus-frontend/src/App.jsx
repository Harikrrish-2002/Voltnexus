import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import DealerDashboard from './pages/DealerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InteractiveBackground from './components/InteractiveBackground';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setIsLoggedIn(true);
        setUser(parsedUser.name);
        setRole(parsedUser.role);
      } catch (e) {
        console.error("Failed to parse userInfo", e);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (selectedRole, email, name) => {
    // Login functionality
    setIsLoggedIn(true);
    // Use name if available, otherwise try to split email, fallback to 'User'
    const displayName = name || (email ? email.split('@')[0] : 'User');
    setUser(displayName);
    setRole(selectedRole);

    // Robust role handling
    const roleKey = selectedRole ? String(selectedRole).trim().toLowerCase() : 'user';

    if (roleKey === 'worker') {
      navigate('/worker-dashboard');
    } else if (roleKey === 'dealer') {
      navigate('/dealer-dashboard');
    } else if (roleKey === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    setUser(null);
    setRole(null);
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-cyan-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      <InteractiveBackground />
      <Navbar isLoggedIn={isLoggedIn} user={user} role={role} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<LandingPage isLoggedIn={isLoggedIn} role={role} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} isLoggedIn={isLoggedIn} role={role} />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute isLoggedIn={isLoggedIn} requiredRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/worker-dashboard" element={
          <ProtectedRoute isLoggedIn={isLoggedIn} requiredRole="Worker">
            <WorkerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dealer-dashboard" element={
          <ProtectedRoute isLoggedIn={isLoggedIn} requiredRole="Dealer">
            <DealerDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
