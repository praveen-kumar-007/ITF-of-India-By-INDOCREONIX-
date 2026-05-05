import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Trash2, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  MessageSquare, 
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './ContactManager.css';
import { TableSkeleton } from '../components/Skeleton';
import ActionModal from '../components/ActionModal';

const ContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const { showToast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/contact`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setContacts(result.data);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ show: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteModal.id;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/contact/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        showToast('success', 'Enquiry deleted');
        setContacts(contacts.filter(c => c.id !== id));
      }
    } catch (error) {
      showToast('error', 'Failed to delete enquiry');
    } finally {
      setDeleteModal({ show: false, id: null });
    }
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && c.status === filter;
  });

  return (
    <div className="contact-manager-page fade-in">
      <header className="page-header-premium">
        <div className="header-info">
          <div className="header-badge">Communication Hub</div>
          <h1>Public Enquiries</h1>
          <p>Manage and respond to messages from the ITF OF INDIA website</p>
        </div>
        <div className="header-stats">
          <div className="stat-card-mini">
            <span className="label">Total Messages</span>
            <span className="value">{contacts.length}</span>
          </div>
          <div className="stat-card-mini success">
            <span className="label">New Today</span>
            <span className="value">
              {contacts.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}
            </span>
          </div>
        </div>
      </header>

      <div className="manager-controls glass-premium">
        <div className="search-wrapper">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or content..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Messages</option>
            <option value="new">Unread</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="contact-list-grid">
          {filteredContacts.length === 0 ? (
            <div className="empty-state-premium">
              <div className="empty-visual">
                <div className="empty-ring"></div>
                <MessageSquare size={48} className="empty-icon" />
              </div>
              <h3>No enquiries found</h3>
              <p>When visitors use the contact form on your website, they will appear here.</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div key={contact.id} className="contact-card-premium glass-premium">
                <div className="card-top">
                  <div className="user-avatar-mini">
                    <User size={20} />
                  </div>
                  <div className="user-details">
                    <h3>{contact.fullName}</h3>
                    <span className="email">{contact.email}</span>
                  </div>
                  <div className={`status-tag ${contact.status || 'new'}`}>
                    {contact.status === 'replied' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {contact.status || 'New'}
                  </div>
                </div>
                
                <div className="card-message">
                  <p>{contact.message}</p>
                </div>

                <div className="card-footer-premium">
                  <div className="timestamp">
                    <Clock size={14} />
                    <span>{new Date(contact.createdAt).toLocaleString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                  <div className="actions">
                    <a href={`mailto:${contact.email}`} className="action-btn-circle reply" title="Reply via Email">
                      <Mail size={16} />
                    </a>
                    <button className="action-btn-circle delete" onClick={() => handleDeleteClick(contact.id)} title="Delete Enquiry">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ActionModal 
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Enquiry"
        message="Are you sure you want to permanently delete this message? This action cannot be undone."
        type="danger"
        confirmText="Delete Message"
      />
    </div>
  );
};

export default ContactManager;
