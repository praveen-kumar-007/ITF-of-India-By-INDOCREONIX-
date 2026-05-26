import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';
import ActionModal from '../components/ActionModal';
import { DashboardSkeleton } from '../components/Skeleton';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Applications = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const [actionModal, setActionModal] = useState({ isOpen: false });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/registrations`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) {
        setRegistrations(result.data.filter(r => r.status !== 'deleted'));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeStatusUpdate = async (id, status, reason = '') => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/registrations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, reason })
      });
      const result = await res.json();
      if (result.success) {
        fetchRegistrations();
        setActionModal({ isOpen: true, type: 'success', title: 'Updated', message: `Application marked as ${status}.`, confirmText: 'Done', onConfirm: () => setActionModal({ isOpen: false }) });
        setSelected(new Set());
      }
    } catch (err) {
      showToast('Action failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    const ids = filtered.map(r => r.id);
    setSelected(new Set(ids));
  };

  const clearSelection = () => setSelected(new Set());

  const bulkUpdate = async (status) => {
    if (!selected.size) return showToast('No applications selected', 'info');
    setIsProcessing(true);
    try {
      for (const id of Array.from(selected)) {
        await executeStatusUpdate(id, status);
      }
      showToast('Bulk operation completed', 'success');
    } catch (err) {
      showToast('Bulk operation failed', 'error');
    } finally {
      setIsProcessing(false);
      setSelected(new Set());
    }
  };

  const exportCSV = () => {
    if (!filtered.length) return showToast('No data to export', 'info');
    const headers = ['Registration No', 'Full Name', 'Discipline', 'State', 'Status', 'Phone', 'Email'];
    const rows = filtered.map(r => [r.registrationNumber || '', r.fullName || '', r.sportsDiscipline || '', r.state || '', r.status || '', r.contactNumber || '', r.email || '']);
    const csv = [headers, ...rows].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id) => {
    setActionModal({ isOpen: true, type: 'warning', title: 'Move to Trash?', message: 'Move this application to recycle bin?', confirmText: 'Move', onConfirm: () => executeDelete(id) });
  };

  const executeDelete = async (id) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/registrations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) {
        fetchRegistrations();
        setActionModal({ isOpen: true, type: 'success', title: 'Moved', message: 'Application moved to Recycle Bin.', confirmText: 'Okay', onConfirm: () => setActionModal({ isOpen: false }) });
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = registrations.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (r.fullName || '').toLowerCase().includes(q) || (r.registrationNumber || '').toLowerCase().includes(q);
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <DashboardSkeleton />;

  return (
    <main className="dashboard-container animate-fade-in">
      <section className="welcome-hero small-hero">
        <div className="hero-content">
          <div className="hero-badge">Applications</div>
          <h1>Registration Applications</h1>
          <p>Review new registrations and take action — approve, reject, or move to recycle bin.</p>
        </div>
      </section>

      <section className="recent-activity-section glass-premium">
        <div className="activity-header">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="activity-title"><h3>Applications</h3></div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn-report" onClick={() => { selectAllVisible(); showToast('All visible selected', 'info'); }}>Select All</button>
              <button className="btn-report" onClick={clearSelection}>Clear</button>
              <button className="btn-report" onClick={() => bulkUpdate('approved')} disabled={!selected.size}>Bulk Approve</button>
              <button className="btn-report" onClick={() => bulkUpdate('rejected')} disabled={!selected.size}>Bulk Reject</button>
              <button className="btn-report" onClick={exportCSV}>Export CSV</button>
            </div>
          </div>
          <div className="activity-filters">
            <input placeholder="Search applicants..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="activity-table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Athlete</th>
                <th>Discipline</th>
                <th>State</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} />
                  </td>
                  <td>
                    <div className="athlete-cell">
                      <img src={r.photo || 'https://via.placeholder.com/40'} alt="" />
                      <div>
                        <strong>{r.fullName}</strong>
                        <span>{r.registrationNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td>{r.sportsDiscipline}</td>
                  <td>{r.state}</td>
                  <td><span className={`status-pill status-${r.status}`}>{r.status}</span></td>
                  <td>
                    <div className="action-row">
                      <button className="mini-btn view" onClick={() => navigate(`/athletes/${r.id}`)} title="View"><Eye size={16} /></button>
                      {r.status === 'pending' && (
                        <>
                          <button className="mini-btn approve" onClick={() => setActionModal({ isOpen: true, type: 'success', title: 'Approve Application?', message: `Approve ${r.fullName}?`, confirmText: 'Approve', onConfirm: () => executeStatusUpdate(r.id, 'approved') })} title="Approve"><CheckCircle size={16} /></button>
                          <button className="mini-btn reject" onClick={() => setActionModal({ isOpen: true, type: 'danger', title: 'Reject Application?', message: `Reject ${r.fullName}? Provide reason.`, showInput: true, inputPlaceholder: 'Reason...', confirmText: 'Reject', onConfirm: (reason) => executeStatusUpdate(r.id, 'rejected', reason) })} title="Reject"><XCircle size={16} /></button>
                        </>
                      )}
                      <button className="mini-btn delete" onClick={() => handleDelete(r.id)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state">No applications found.</div>}
        </div>
      </section>

      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false })}
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

export default Applications;
