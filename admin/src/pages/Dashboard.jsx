import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Users, Clock, CheckCircle, XCircle, Search, 
  Download, Eye, Trash2, Edit2, Filter, 
  User, Mail, Phone, Calendar, MapPin, CreditCard, FileText, Save, X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState([]);


  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState(null);
  const [editReg, setEditReg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const result = await response.json();
      if (result.success) {
        // Filter out deleted players for main dashboard
        const activeRegistrations = result.data.filter(reg => reg.status !== 'deleted');
        setRegistrations(activeRegistrations);
      }

    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this as ${status}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (result.success) {
        showToast(`Application ${status} successfully`, 'success');
        fetchRegistrations();
        setSelectedReg(null);
      } else {
        showToast(result.message || 'Update failed', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Error updating status', 'error');
    }

  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/${editReg.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editReg)
      });
      const result = await response.json();
      if (result.success) {
        showToast('Details updated successfully', 'success');
        setEditReg(null);
        fetchRegistrations();
      } else {
        showToast(result.message || 'Update failed', 'error');
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      showToast('Error updating registration', 'error');
    } finally {

      setIsUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('CRITICAL: Are you sure you want to permanently delete this registration? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        showToast('Registration deleted successfully', 'success');
        fetchRegistrations();
      } else {
        showToast(result.message || 'Deletion failed', 'error');
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      showToast('Error deleting registration', 'error');
    } finally {

      setIsDeleting(false);
    }
  };

  const filteredData = registrations.filter(reg => {
    const fullName = reg.fullName || '';
    const regNo = reg.registrationNumber || '';
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          regNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || reg.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <main className="admin-main-content-inner">

      <header className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage athlete registrations and system status.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><Users /></div>
          <div className="stat-info">
            <h3>Total Athletes</h3>
            <p>{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><Clock /></div>
          <div className="stat-info">
            <h3>Pending</h3>
            <p>{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#10b981' }}><CheckCircle /></div>
          <div className="stat-info">
            <h3>Approved</h3>
            <p>{stats.approved}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><XCircle /></div>
          <div className="stat-info">
            <h3>Rejected</h3>
            <p>{stats.rejected}</p>
          </div>
        </div>
      </section>

      {/* Data Table Container */}
      <div className="data-table-container">
        <div className="table-header">
          <div className="search-wrapper">
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by name or registration ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Filter size={18} color="#64748b" />
            <select 
              style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Athlete Name</th>
              <th>Reg. Number</th>
              <th>Category</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((reg) => (
              <tr key={reg.id}>
                <td>
                  <div className="athlete-info">
                    <img 
                      src={reg.photo || 'https://via.placeholder.com/40'} 
                      className="athlete-photo"
                      alt="" 
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{reg.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{reg.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>{reg.registrationNumber}</td>
                <td>{reg.category || 'Athlete'}</td>
                <td>{new Date(reg.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${reg.status}`}>
                    {reg.status}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon" onClick={() => navigate(`/athletes/${reg.id}`)} title="View Full Profile">
                      <Eye size={18} />
                    </button>

                    <button className="btn-icon" onClick={() => setEditReg(reg)} title="Edit Details">
                      <Edit2 size={18} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(reg.id)} title="Delete Registration">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <Filter size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>No matching registrations found.</p>
          </div>
        )}
      </div>

      {/* Edit Details Modal */}
      {editReg && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <button className="modal-close" onClick={() => setEditReg(null)}><X size={20} /></button>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Edit2 size={24} color="var(--secondary)" /> Edit Athlete Details
            </h2>
            
            <form onSubmit={handleUpdateDetails}>
              <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={editReg.fullName} 
                    onChange={(e) => setEditReg({...editReg, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={editReg.email} 
                      onChange={(e) => setEditReg({...editReg, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone</label>
                    <input 
                      type="text" 
                      value={editReg.phone} 
                      onChange={(e) => setEditReg({...editReg, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Category</label>
                    <input 
                      type="text" 
                      value={editReg.category} 
                      onChange={(e) => setEditReg({...editReg, category: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label>Weight (kg)</label>
                    <input 
                      type="number" 
                      value={editReg.weight} 
                      onChange={(e) => setEditReg({...editReg, weight: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn-action btn-success" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-action" onClick={() => setEditReg(null)} style={{ background: '#f1f5f9', color: '#64748b' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {selectedReg && (
        <div className="modal-overlay" onClick={() => setSelectedReg(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedReg(null)}><X size={20} /></button>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', alignItems: 'center' }}>
              <img src={selectedReg.photo} style={{ width: 140, height: 140, borderRadius: '24px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} alt="" />
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{selectedReg.fullName}</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <p style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '1.1rem' }}>{selectedReg.registrationNumber}</p>
                   <span className={`status-badge status-${selectedReg.status}`}>{selectedReg.status}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="info-card">
                <h4><User size={18} /> Personal Information</h4>
                <div className="info-grid">
                  <div className="info-item"><label>Email</label><p>{selectedReg.email}</p></div>
                  <div className="info-item"><label>Phone</label><p>{selectedReg.phone}</p></div>
                  <div className="info-item"><label>Date of Birth</label><p>{selectedReg.dob}</p></div>
                  <div className="info-item"><label>Gender</label><p>{selectedReg.gender}</p></div>
                  <div className="info-item"><label>Weight</label><p>{selectedReg.weight} kg</p></div>
                  <div className="info-item"><label>Height</label><p>{selectedReg.height} cm</p></div>
                  <div className="info-item" style={{ gridColumn: 'span 2' }}><label>Address</label><p>{selectedReg.address}</p></div>
                </div>
              </div>

              <div className="info-card">
                <h4><FileText size={18} /> Documentation</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <a href={selectedReg.aadharFront} target="_blank" rel="noreferrer" className="doc-link"><Eye size={16} /> Aadhar Front</a>
                  <a href={selectedReg.aadharBack} target="_blank" rel="noreferrer" className="doc-link"><Eye size={16} /> Aadhar Back</a>
                  <a href={selectedReg.signature} target="_blank" rel="noreferrer" className="doc-link"><Eye size={16} /> Signature</a>
                  <a href={selectedReg.paymentProof} target="_blank" rel="noreferrer" className="doc-link" style={{ borderColor: '#fed7aa', color: '#9a3412' }}><CreditCard size={16} /> Payment Proof</a>
                </div>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <label style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Transaction ID / UTR</label>
                  <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>{selectedReg.transactionId}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-action btn-success" 
                onClick={() => handleStatusUpdate(selectedReg.id, 'approved')}
                disabled={selectedReg.status === 'approved'}
              >
                Approve Application
              </button>
              <button 
                className="btn-action btn-danger" 
                onClick={() => handleStatusUpdate(selectedReg.id, 'rejected')}
                disabled={selectedReg.status === 'rejected'}
              >
                Reject Application
              </button>
              <button 
                className="btn-action" 
                style={{ background: '#f1f5f9', color: '#64748b' }}
                onClick={() => setSelectedReg(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
