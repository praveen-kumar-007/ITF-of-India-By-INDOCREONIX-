import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, LogOut, Shield, User, 
  Trash2, Activity, CreditCard, Printer, Image as ImageIcon, 
  Bell, Megaphone, MessageSquare 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 1024) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

      <div className="logo-section">
        <div className="logo-wrapper">
          <img src="/logo.jpeg" alt="Logo" />
        </div>
        <div>
          <h2>ITF Admin</h2>
          <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>{user.fullName || 'Admin'}</p>
        </div>
      </div>
      
      <nav className="nav-links">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} onClick={handleLinkClick}>
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link to="/athletes" className={`nav-item ${location.pathname === '/athletes' ? 'active' : ''}`} onClick={handleLinkClick}>
          <Users size={20} />
          Athletes
        </Link>
        <Link to="/applications" className={`nav-item ${location.pathname === '/applications' ? 'active' : ''}`} onClick={handleLinkClick}>
          <FileText size={20} />
          Applications
        </Link>
        <Link to="/receipt-generator" className={`nav-item ${location.pathname === '/receipt-generator' ? 'active' : ''}`} onClick={handleLinkClick}>
          <Printer size={20} />
          Receipt Generator
        </Link>
        <Link to="/gallery" className={`nav-item ${location.pathname === '/gallery' ? 'active' : ''}`} onClick={handleLinkClick}>
          <ImageIcon size={20} />
          Gallery
        </Link>
        <Link to="/news" className={`nav-item ${location.pathname === '/news' ? 'active' : ''}`} onClick={handleLinkClick}>
          <Bell size={20} />
          News & Notices
        </Link>
        <Link to="/notices" className={`nav-item ${location.pathname === '/notices' ? 'active' : ''}`} onClick={handleLinkClick}>
          <Megaphone size={20} />
          Hero Notice Board
        </Link>
        <Link to="/enquiries" className={`nav-item ${location.pathname === '/enquiries' ? 'active' : ''}`} onClick={handleLinkClick}>
          <MessageSquare size={20} />
          Website Enquiries
        </Link>
        {user.role === 'superadmin' && (
          <>
            <Link to="/manage-admins" className={`nav-item ${location.pathname === '/manage-admins' ? 'active' : ''}`} onClick={handleLinkClick}>
              <Shield size={20} />
              Manage Admins
            </Link>
            <Link to="/system-health" className={`nav-item ${location.pathname === '/system-health' ? 'active' : ''}`} onClick={handleLinkClick}>
              <Activity size={20} />
              System Health
            </Link>
            <Link to="/payment-settings" className={`nav-item ${location.pathname === '/payment-settings' ? 'active' : ''}`} onClick={handleLinkClick}>
              <CreditCard size={20} />
              Payment Gateway
            </Link>
          </>
        )}
        <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`} onClick={handleLinkClick}>
          <User size={20} />
          My Profile
        </Link>
        <Link to="/recycle-bin" className={`nav-item ${location.pathname === '/recycle-bin' ? 'active' : ''}`} onClick={handleLinkClick}>
          <Trash2 size={20} />
          Recycle Bin
        </Link>
      </nav>


      <button 
        onClick={handleLogout}
        className="nav-item logout-btn" 
        style={{ marginTop: 'auto', background: 'none', border: 'none', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </aside>
  );
};

export default Sidebar;
