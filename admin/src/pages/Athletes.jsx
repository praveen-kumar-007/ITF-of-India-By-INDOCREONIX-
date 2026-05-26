import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';
import { DashboardSkeleton } from '../components/Skeleton';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Athletes = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/registrations`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) {
        // Show only approved athletes in roster
        setAthletes(result.data.filter(a => a.status === 'approved'));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load athletes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = athletes.filter(a => {
    const q = searchTerm.toLowerCase();
    return (
      (a.fullName || '').toLowerCase().includes(q) ||
      (a.registrationNumber || '').toLowerCase().includes(q) ||
      (a.state || '').toLowerCase().includes(q)
    );
  });

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    if (!filtered.length) return showToast('No data to export', 'info');
    const headers = ['Registration No', 'Full Name', 'Discipline', 'State', 'Phone', 'Email'];
    const rows = filtered.map(r => [r.registrationNumber || '', r.fullName || '', r.sportsDiscipline || '', r.state || '', r.contactNumber || '', r.email || '']);
    const csv = [headers, ...rows].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `athletes_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <main className="dashboard-container animate-fade-in">
      <section className="welcome-hero small-hero">
        <div className="hero-content">
          <div className="hero-badge"><Users size={14} /> <span>Athlete Directory</span></div>
          <h1>All Athletes</h1>
          <p>Browse and manage your athlete roster. Use quick actions to view profiles.</p>
        </div>
      </section>

      <section className="recent-activity-section glass-premium">
        <div className="activity-header">
          <div className="activity-title">
            <Eye size={20} />
            <h3>Athlete Roster</h3>
          </div>
          <div className="activity-filters">
            <input placeholder="Search by name, reg no or state..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
            <button className="btn-report" onClick={exportCSV} style={{ marginLeft: 8 }}>Export CSV</button>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="athlete-cell">
                      <img src={a.photo || 'https://via.placeholder.com/40'} alt="" />
                      <div>
                        <strong>{a.fullName}</strong>
                        <span>{a.registrationNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td>{a.sportsDiscipline}</td>
                  <td>{a.state}</td>
                  <td><span className={`status-pill status-${a.status}`}>{a.status}</span></td>
                  <td>
                    <div className="action-row">
                      <button className="mini-btn view" onClick={() => navigate(`/athletes/${a.id}`)} title="View Detail"><Eye size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state">No athletes found.</div>}
          <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
            <div>{filtered.length} athletes</div>
            <div className="pagination-controls">
              <button className="mini" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <span style={{ margin: '0 8px' }}>{page} / {totalPages}</span>
              <button className="mini" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Athletes;
