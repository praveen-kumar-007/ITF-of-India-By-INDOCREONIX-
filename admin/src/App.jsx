import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/Login';
import AdminManagement from './pages/AdminManagement';
import Profile from './pages/Profile';
import PlayerDetails from './pages/PlayerDetails';
import RecycleBin from './pages/RecycleBin';
import SystemHealth from './pages/SystemHealth';
import { ToastProvider } from './context/ToastContext';

import './styles/Global.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  
                  {/* Mobile Header */}
                  <header className="mobile-header">
                    <button className="menu-toggle" onClick={toggleSidebar}>
                      {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <div className="mobile-logo">
                      <div className="mobile-logo-wrapper">
                        <img src="/logo.jpeg" alt="Logo" />
                      </div>
                      <span>ITF Admin</span>
                    </div>
                  </header>


                  {/* Overlay for mobile sidebar */}
                  {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

                  <div className="admin-main-content">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/athletes/:id" element={<PlayerDetails />} />
                      <Route path="/manage-admins" element={<AdminManagement />} />
                      <Route path="/system-health" element={<SystemHealth />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/recycle-bin" element={<RecycleBin />} />
                    </Routes>

                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ToastProvider>
  );
}



export default App;
