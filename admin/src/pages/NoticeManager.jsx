import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Bell, 
  X, 
  Loader2, 
  Calendar, 
  AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './NewsManager.css'; // Reuse the news styling for consistency
import { TableSkeleton } from '../components/Skeleton';
import ActionModal from '../components/ActionModal';

const NoticeManager = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const { showToast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/news`);
      const result = await response.json();
      if (result.success) {
        // Only show items categorized as 'Notice' or 'Announcement'
        const filtered = result.data.filter(n => n.category === 'Notice' || n.category === 'Announcement');
        setNotices(filtered);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch hero notices');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showToast('error', 'Notice text is required');
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', 'Official notice for the hero board.'); // Internal placeholder
      data.append('category', 'Notice');
      data.append('date', formData.date);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/news`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (result.success) {
        showToast('success', 'Notice added to board');
        setShowModal(false);
        setFormData({ title: '', date: new Date().toISOString().split('T')[0] });
        fetchNotices();
      } else {
        showToast('error', result.message || 'Failed to add notice');
      }
    } catch (error) {
      showToast('error', 'Failed to add notice');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ show: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteModal.id;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        showToast('success', 'Notice removed');
        setNotices(notices.filter(n => n.id !== id));
      }
    } catch (error) {
      showToast('error', 'Deletion failed');
    } finally {
      setDeleteModal({ show: false, id: null });
    }
  };

  return (
    <div className="news-manager animate-fade-in">
      <div className="admin-bg-accent"></div>
      
      <header className="page-header premium-header">
        <div className="header-content">
          <div className="header-badge">Hero Component</div>
          <h1>Live Notice Board</h1>
          <p>Directly manage the live scrolling notices on the home page hero section</p>
        </div>
        <div className="header-actions">
          <button className="btn-premium-action" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            <span>Add Live Notice</span>
          </button>
        </div>
      </header>

      <div className="notice-guideline">
        <AlertCircle size={18} />
        <p><strong>Note:</strong> Only the latest 5 notices are displayed on the home page hero section at any time.</p>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="news-content-wrapper">
          {notices.length === 0 ? (
            <div className="empty-state-premium">
              <div className="empty-visual">
                <div className="empty-ring"></div>
                <Bell size={48} className="empty-icon" />
              </div>
              <h3>Notice Board is Empty</h3>
              <p>Add a new notice to start displaying important updates to your visitors.</p>
              <button className="btn-outline-premium" onClick={() => setShowModal(true)}>
                <Plus size={20} /> Add First Notice
              </button>
            </div>
          ) : (
            <div className="notice-list-simple">
              {notices.map((notice) => (
                <div key={notice.id} className="notice-strip-premium">
                  <div className="notice-strip-date">
                    <span className="day">{new Date(notice.date).getDate()}</span>
                    <span className="month">{new Date(notice.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                  </div>
                  <div className="notice-strip-content">
                    <p>{notice.title}</p>
                  </div>
                  <div className="notice-strip-actions">
                    <button className="action-btn-circle delete" onClick={() => handleDeleteClick(notice.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay-premium">
          <div className="modal-content-premium">
            <div className="modal-header-premium">
              <div>
                <h2>New Live Notice</h2>
                <p>This will appear in the Hero section side-card</p>
              </div>
              <button className="close-btn-premium" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group-premium">
                <label>Notice Text (Short & Clear)</label>
                <textarea 
                  rows="3"
                  placeholder="e.g. State Championship 2024 - Registration Open"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="form-group-premium">
                <label>Display Date</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="modal-footer-premium">
                <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-premium" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : 'Post to Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .notice-guideline {
          background: rgba(251, 191, 36, 0.1);
          color: #92400e;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          font-size: 0.9rem;
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .form-group-premium {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .form-group-premium label {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .form-group-premium textarea,
        .form-group-premium input[type="date"] {
          width: 100%;
          padding: 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          background: #f8fafc;
          transition: all 0.3s ease;
          color: #0f172a;
          font-family: inherit;
        }

        .form-group-premium textarea:focus,
        .form-group-premium input[type="date"]:focus {
          outline: none;
          background: white;
          border-color: var(--secondary);
          box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.1);
          transform: translateY(-2px);
        }

        .form-group-premium textarea {
          resize: none;
          min-height: 100px;
        }
        
        .notice-list-simple {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .notice-strip-premium {
          background: white;
          padding: 1.2rem 1.5rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          border: 1px solid #f1f5f9;
          transition: 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        
        .notice-strip-premium:hover {
          transform: translateX(10px);
          border-color: var(--secondary);
          box-shadow: 0 10px 15px rgba(0,0,0,0.05);
        }
        
        .notice-strip-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          padding-right: 1.5rem;
          border-right: 1px solid #f1f5f9;
          line-height: 1.2;
        }
        
        .notice-strip-date .day {
          font-size: 1.4rem;
          font-weight: 800;
          color: #1e293b;
        }
        
        .notice-strip-date .month {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--secondary);
        }
        
        .notice-strip-content {
          flex: 1;
        }
        
        .notice-strip-content p {
          color: #334155;
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .notice-strip-actions {
          opacity: 0;
          transition: 0.2s;
        }
        
        .notice-strip-premium:hover .notice-strip-actions {
          opacity: 1;
        }
      `}</style>

      <ActionModal 
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Remove Live Notice"
        message="Are you sure you want to remove this notice from the scrolling board? It will be deleted from the database."
        type="danger"
        confirmText="Delete Notice"
      />
    </div>
  );
};

export default NoticeManager;
