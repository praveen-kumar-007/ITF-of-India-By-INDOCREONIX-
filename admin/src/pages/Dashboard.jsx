import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Clock, CheckCircle, XCircle, Search, 
  Eye, Trash2, FileText, Zap, Activity, ArrowRight, Database, Cloud, Mail, ExternalLink, ShieldCheck, MapPin, Download, CreditCard
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';
import ActionModal from '../components/ActionModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showInput: false,
    confirmText: 'Confirm',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchRegistrations();
    fetchSystemHealth();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        const activeRegistrations = result.data.filter(reg => reg.status !== 'deleted');
        setRegistrations(activeRegistrations);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/system-health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setHealthData(result.data);
      }
    } catch (err) {
      console.error("Health check failed");
    }
  };

  const handleStatusUpdate = (reg, status) => {
    if (status === 'approved') {
      setActionModal({
        isOpen: true,
        type: 'success',
        title: 'Approve Application?',
        message: `Confirm approval for ${reg.fullName}. They will receive access credentials via email.`,
        confirmText: 'Approve Now',
        onConfirm: () => executeStatusUpdate(reg.id, 'approved')
      });
    } else if (status === 'rejected') {
      setActionModal({
        isOpen: true,
        type: 'danger',
        title: 'Reject Application?',
        message: `Please provide a reason for rejecting ${reg.fullName}.`,
        showInput: true,
        inputPlaceholder: 'Reason for rejection...',
        confirmText: 'Confirm Reject',
        onConfirm: (reason) => executeStatusUpdate(reg.id, 'rejected', reason)
      });
    }
  };

  const executeStatusUpdate = async (id, status, reason = '') => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, reason })
      });
      const result = await response.json();
      if (result.success) {
        fetchRegistrations();
        setActionModal({
          isOpen: true,
          type: 'success',
          title: 'Updated',
          message: `Athlete application marked as ${status} successfully.`,
          confirmText: 'Done',
          onConfirm: () => setActionModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    } catch (error) {
      showToast('Status update failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = (reg) => {
    setActionModal({
      isOpen: true,
      type: 'warning',
      title: 'Move to Trash?',
      message: `Move ${reg.fullName} to the Recycle Bin? This action is reversible.`,
      confirmText: 'Move to Trash',
      onConfirm: () => executeDelete(reg.id)
    });
  };

  const executeDelete = async (id) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        fetchRegistrations();
        setActionModal({
          isOpen: true,
          type: 'success',
          title: 'Moved',
          message: 'Athlete has been moved to the Recycle Bin.',
          confirmText: 'Okay',
          onConfirm: () => setActionModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    } catch (error) {
      showToast('Delete failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
  };
  // Calculate top states for distribution
  const stateDistribution = registrations.reduce((acc, reg) => {
    const state = reg.state || 'Other';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});

  const topStates = Object.entries(stateDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const filteredData = registrations
    .filter(reg => {
      const fullName = reg.fullName || '';
      const regNo = reg.registrationNumber || '';
      const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            regNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || reg.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .slice(0, 8);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading System Analytics...</p>
      </div>
    );
  }

  return (
    <main className="dashboard-container animate-fade-in">
      {/* Welcome Hero Section */}
      <section className="welcome-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={14} /> <span>Administrative Access</span>
          </div>
          <h1>System Overview</h1>
          <p>The administrative portal is fully operational. There are <strong>{stats.pending}</strong> pending athlete registrations requiring verification.</p>
          <div className="hero-footer">
            <button className="btn-hero-primary" onClick={() => navigate('/registrations')}>
              View All Registrations <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="pulse-circle"></div>
          <img src="https://res.cloudinary.com/dgfpfxkpk/image/upload/q_auto/f_auto/v1777829890/logo_hdbywh.png" alt="ITF Logo" />
        </div>
      </section>

      {/* Main Grid: Mixture of Stats and Health */}
      <div className="dashboard-mixture-grid">
        {/* Statistics Column */}
        <div className="stats-column">
          <div className="section-title">
            <Zap size={18} /> <span>Live Metrics</span>
          </div>
          <div className="metrics-grid">
            <div className="metric-card total">
              <div className="metric-head">
                <Users size={24} />
                <span className="metric-trend">+12%</span>
              </div>
              <div className="metric-body">
                <h3>Total Athletes</h3>
                <p>{stats.total}</p>
              </div>
            </div>
            <div className="metric-card pending">
              <div className="metric-head">
                <Clock size={24} />
                <span className="metric-tag">Action Needed</span>
              </div>
              <div className="metric-body">
                <h3>Pending Approval</h3>
                <p>{stats.pending}</p>
              </div>
            </div>
            <div className="metric-card approved">
              <div className="metric-head">
                <CheckCircle size={24} />
              </div>
              <div className="metric-body">
                <h3>Verified Members</h3>
                <p>{stats.approved}</p>
              </div>
            </div>
            <div className="metric-card rejected">
              <div className="metric-head">
                <XCircle size={24} />
              </div>
              <div className="metric-body">
                <h3>Declined Profiles</h3>
                <p>{stats.rejected}</p>
              </div>
            </div>
          </div>

          <div className="momentum-card glass-premium">
            <div className="section-title">
              <Activity size={16} /> <span>Registration Momentum</span>
            </div>
            <div className="momentum-bars">
              <div className="m-bar-group">
                <div className="m-bar-info"><span>Approved</span> <span>{stats.approved}</span></div>
                <div className="m-bar-track"><div className="m-bar-fill approved" style={{ width: `${(stats.approved/stats.total)*100 || 0}%` }}></div></div>
              </div>
              <div className="m-bar-group">
                <div className="m-bar-info"><span>Pending</span> <span>{stats.pending}</span></div>
                <div className="m-bar-track"><div className="m-bar-fill pending" style={{ width: `${(stats.pending/stats.total)*100 || 0}%` }}></div></div>
              </div>
              <div className="m-bar-group">
                <div className="m-bar-info"><span>Rejected</span> <span>{stats.rejected}</span></div>
                <div className="m-bar-track"><div className="m-bar-fill rejected" style={{ width: `${(stats.rejected/stats.total)*100 || 0}%` }}></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Health Summary */}
        <div className="health-column">
          <div className="section-title">
            <Activity size={18} /> <span>Service Integrity</span>
          </div>
          <div className="health-summary-card glass-premium">
            <div className="health-header">
              <div className={`health-status-dot ${(!healthData || (healthData?.services?.firebase?.status === 'healthy' && healthData?.services?.cloudinary?.status === 'healthy')) ? 'active' : 'warning'}`}></div>
              <span>{(!healthData || (healthData?.services?.firebase?.status === 'healthy' && healthData?.services?.cloudinary?.status === 'healthy')) ? 'All Systems Operational' : 'System Alert'}</span>
            </div>
            <div className="health-items">
              <div className="h-item">
                <Database size={16} />
                <span>Firebase DB</span>
                <span className={`h-val ${(!healthData || healthData?.services?.firebase?.status === 'healthy') ? 'active' : 'error'}`}>
                  {(!healthData || healthData?.services?.firebase?.status === 'healthy') ? 'Connected' : 'Issues'}
                </span>
              </div>
              <div className="h-item">
                <Cloud size={16} />
                <span>Cloudinary</span>
                <span className={`h-val ${(!healthData || healthData?.services?.cloudinary?.status === 'healthy') ? 'active' : 'error'}`}>
                  {(!healthData || healthData?.services?.cloudinary?.status === 'healthy') ? 'Connected' : 'Issues'}
                </span>
              </div>
              <div className="h-item">
                <Mail size={16} />
                <span>Mail Gateway</span>
                <span className={`h-val ${(!healthData || healthData?.services?.mail?.status === 'healthy') ? 'active' : 'error'}`}>
                  {(!healthData || healthData?.services?.mail?.status === 'healthy') ? 'Active' : 'Mock'}
                </span>
              </div>
            </div>
            <button className="btn-full-health" onClick={() => navigate('/system-health')}>
              Detailed Diagnostics <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Command Shortcuts Section */}
      <section className="command-shortcuts-section">
        <div className="section-title">
          <Zap size={18} /> <span>Command Shortcuts</span>
        </div>
        <div className="shortcuts-grid">
          <div className="shortcut-card glass-premium" onClick={() => navigate('/admins')}>
            <ShieldCheck size={24} />
            <div className="shortcut-info">
              <h4>Admin Management</h4>
              <p>Manage system access</p>
            </div>
            <ArrowRight size={20} className="shortcut-arrow" />
          </div>
          <div className="shortcut-card glass-premium" onClick={() => navigate('/recycle-bin')}>
            <Trash2 size={24} />
            <div className="shortcut-info">
              <h4>Recycle Bin</h4>
              <p>Restore deleted data</p>
            </div>
            <ArrowRight size={20} className="shortcut-arrow" />
          </div>
          <div className="shortcut-card glass-premium" onClick={() => navigate('/system-health')}>
            <Activity size={24} />
            <div className="shortcut-info">
              <h4>System Health</h4>
              <p>Monitor service status</p>
            </div>
            <ArrowRight size={20} className="shortcut-arrow" />
          </div>
        </div>
      </section>

      {/* Analytics & Insights Mixture */}
      <div className="dashboard-mixture-grid">
        {/* Regional Distribution */}
        <div className="analytics-column">
          <div className="section-title">
            <MapPin size={18} /> <span>Regional Distribution</span>
          </div>
          <div className="distribution-card glass-premium">
            <div className="dist-list">
              {topStates.map(([state, count], idx) => (
                <div key={state} className="dist-item">
                  <div className="dist-info">
                    <span className="dist-rank">#{idx + 1}</span>
                    <span className="dist-name">{state}</span>
                  </div>
                  <div className="dist-bar-wrapper">
                    <div 
                      className="dist-bar" 
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="dist-count">{count} Athletes</span>
                </div>
              ))}
              {topStates.length === 0 && <p className="empty-msg">No distribution data available yet.</p>}
            </div>
          </div>
        </div>

        {/* Quick Reports & Actions */}
        <div className="reports-column">
          <div className="section-title">
            <FileText size={18} /> <span>Executive Reports</span>
          </div>
          <div className="reports-card glass-premium">
            <p className="reports-desc">Generate instant snapshots of your athlete database.</p>
            <div className="reports-btns">
              <button className="btn-report" onClick={() => showToast('Report generation started...', 'info')}>
                <Download size={16} /> <span>Master Athlete List (CSV)</span>
              </button>
              <button className="btn-report" onClick={() => showToast('Preparing financial summary...', 'info')}>
                <CreditCard size={16} /> <span>Financial Audit Report</span>
              </button>
              <button className="btn-report" onClick={() => showToast('Generating verification log...', 'info')}>
                <ShieldCheck size={16} /> <span>Verification History</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <section className="recent-activity-section glass-premium">
        <div className="activity-header">
          <div className="activity-title">
            <FileText size={20} />
            <h3>Recent Registration Requests</h3>
          </div>
          <div className="activity-filters">
            <input 
              type="text" 
              placeholder="Quick search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="activity-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Athlete</th>
                <th>Discipline</th>
                <th>State</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((reg) => (
                <tr key={reg.id}>
                  <td>
                    <div className="athlete-cell">
                      <img src={reg.photo || 'https://via.placeholder.com/40'} alt="" />
                      <div>
                        <strong>{reg.fullName}</strong>
                        <span>{reg.registrationNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td>{reg.sportsDiscipline}</td>
                  <td>{reg.state}</td>
                  <td>
                    <span className={`status-pill status-${reg.status}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-row">
                      <button className="mini-btn view" onClick={() => navigate(`/athletes/${reg.id}`)} title="View Detail"><Eye size={16} /></button>
                      {reg.status === 'pending' && (
                        <>
                          <button className="mini-btn approve" onClick={() => handleStatusUpdate(reg, 'approved')} title="Quick Approve"><CheckCircle size={16} /></button>
                          <button className="mini-btn reject" onClick={() => handleStatusUpdate(reg, 'rejected')} title="Quick Reject"><XCircle size={16} /></button>
                        </>
                      )}
                      <button className="mini-btn delete" onClick={() => handleDelete(reg)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="empty-state">No recent activity found.</div>
          )}
        </div>
        <div className="activity-footer">
          <button className="btn-text-link" onClick={() => navigate('/registrations')}>
            View all registrations ({stats.total})
          </button>
        </div>
      </section>

      <ActionModal 
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={actionModal.onConfirm}
        title={actionModal.title}
        message={actionModal.message}
        type={actionModal.type}
        showInput={actionModal.showInput}
        inputPlaceholder={actionModal.inputPlaceholder}
        confirmText={actionModal.confirmText}
        loading={isProcessing}
      />
    </main>
  );
};

export default Dashboard;
