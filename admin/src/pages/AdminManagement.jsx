import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Mail, Shield, User, Star, Eye, Camera, Edit2, X, Save, EyeOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './AdminManagement.css';

import ActionModal from '../components/ActionModal';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminManagement = () => {
  const { showToast } = useToast();
  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'admin',
    status: 'active'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Custom Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {}
  });

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setAdmins(result.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenCreate = () => {
    setEditAdmin(null);
    setFormData({ fullName: '', email: '', password: '', role: 'admin', status: 'active' });
    setShowModal(true);
  };

  const handleOpenEdit = (admin) => {
    setEditAdmin(admin);
    setFormData({
      fullName: admin.fullName,
      email: admin.email,
      password: '', // Leave blank unless changing
      role: admin.role || 'admin',
      status: admin.status || 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = editAdmin 
        ? `${API_BASE_URL}/auth/${editAdmin.id}`
        : `${API_BASE_URL}/auth/create-admin`;
      
      const method = editAdmin ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        setShowModal(false);
        fetchAdmins();
        setActionModal({
          isOpen: true,
          title: 'Success!',
          message: editAdmin ? 'Admin account updated successfully.' : 'New admin account created successfully.',
          type: 'success',
          confirmText: 'Great',
          onConfirm: () => setActionModal({ ...actionModal, isOpen: false })
        });
      } else {
        showToast(result.message || 'Action failed', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('An error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = (id, name) => {
    setActionModal({
      isOpen: true,
      title: 'Delete Admin Account?',
      message: `Are you sure you want to permanently delete the admin account for ${name}? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => executeDeleteAdmin(id)
    });
  };

  const executeDeleteAdmin = async (id) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        fetchAdmins();
        setActionModal({
          isOpen: true,
          title: 'Deleted',
          message: 'The admin account has been removed permanently.',
          type: 'success',
          confirmText: 'Done',
          onConfirm: () => setActionModal({ ...actionModal, isOpen: false })
        });
      } else {
        showToast(result.message || 'Failed to delete admin', 'error');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      showToast('Error deleting admin', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin': return <Star size={16} />;
      case 'admin': return <Shield size={16} />;
      case 'viewer': return <Eye size={16} />;
      case 'media': return <Camera size={16} />;
      default: return <User size={16} />;
    }
  };

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Synchronizing Administrative Data...</p>
    </div>
  );

  return (
    <main className="admin-management">
      <header className="admin-header">
        <div>
          <h1>Admin Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create and manage administrative access roles.</p>
        </div>
        <button className="add-admin-btn" onClick={handleOpenCreate}>
          <UserPlus size={20} />
          Add New Admin
        </button>
      </header>

      <section className="admins-grid">
        {admins.map((admin) => (
          <div key={admin.id} className="admin-card">
            <div className="admin-info">
              <div className="admin-avatar">
                {admin.photo ? (
                  <img src={admin.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
                ) : admin.fullName.charAt(0)}
              </div>
              <div className="admin-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <h3>{admin.fullName}</h3>
                   <span className={`role-badge role-${admin.role || 'admin'}`}>
                      {getRoleIcon(admin.role)} {admin.role || 'admin'}
                   </span>
                </div>
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Mail size={14} /> {admin.email}
                </p>
              </div>
            </div>
            
            <div className="admin-status">
              <span className={`status-badge status-${admin.status || 'active'}`}>
                {admin.status || 'Active'}
              </span>
              <div className="action-btns">
                <button 
                  className="premium-btn btn-gradient-blue btn-icon" 
                  onClick={() => handleOpenEdit(admin)}
                  title="Edit Admin"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  className="premium-btn btn-gradient-red btn-icon" 
                  onClick={() => handleDeleteAdmin(admin.id, admin.fullName)}
                  title="Delete Admin"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {admins.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '24px', boxShadow: 'var(--shadow-md)' }}>
            <Shield size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <p style={{ color: '#64748b' }}>No sub-admins found. Create one to get started.</p>
          </div>
        )}
      </section>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2>{editAdmin ? 'Edit Admin Account' : 'Create Admin Account'}</h2>
               <button className="cancel-btn" onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="admin@itfindia.com"
                />
              </div>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    className="role-select"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="admin">Administrator</option>
                    <option value="viewer">Viewer</option>
                    <option value="media">Media Manager</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="form-group password-field">
                <label>{editAdmin ? 'New Password (optional)' : 'Initial Password'}</label>
                <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required={!editAdmin} 
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editAdmin ? 'Leave blank to keep current' : '••••••••'}
                    style={{ width: '100%' }}
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn" disabled={submitting}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {submitting ? 'Processing...' : (
                      <>
                        <Save size={18} />
                        {editAdmin ? 'Update Account' : 'Create Account'}
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ActionModal 
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ ...actionModal, isOpen: false })}
        onConfirm={actionModal.onConfirm}
        title={actionModal.title}
        message={actionModal.message}
        type={actionModal.type}
        loading={submitting}
      />
    </main>
  );
};

export default AdminManagement;
