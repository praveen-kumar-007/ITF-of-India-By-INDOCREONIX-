import React, { useState, useEffect } from 'react';
import { 
  Trash2, RotateCcw, Trash, Search, Filter, 
  Calendar, User, AlertTriangle, Eye, ArrowLeft
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import './RecycleBin.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RecycleBin = () => {
  const [deletedPlayers, setDeletedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { showToast } = useToast();
  const navigate = useNavigate();


  useEffect(() => {
    fetchDeletedPlayers();
  }, []);

  const fetchDeletedPlayers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        const trash = result.data.filter(reg => reg.status === 'deleted');
        setDeletedPlayers(trash);
      }
    } catch (error) {
      showToast('Error fetching trash', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Restore this athlete profile?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/${id}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        showToast('Athlete profile restored successfully', 'success');
        fetchDeletedPlayers();
      }
    } catch (error) {
      showToast('Restore failed', 'error');
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('PERMANENT DELETE: This will remove all data and files from Cloudinary forever. Continue?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/${id}/permanent`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        showToast('Deleted permanently from Database and Cloudinary', 'success');
        fetchDeletedPlayers();
      }
    } catch (error) {
      showToast('Permanent deletion failed', 'error');
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('WARNING: This will PERMANENTLY delete ALL items in the recycle bin and their files from Cloudinary. This action cannot be undone. Continue?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/empty-trash`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        showToast('Recycle Bin emptied successfully', 'success');
        fetchDeletedPlayers();
      }
    } catch (error) {
      showToast('Action failed', 'error');
    }
  };

  const filtered = deletedPlayers.filter(p => 

    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="recycle-bin-page">
      <header className="trash-header">
        <div className="title-area">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1><Trash2 size={28} className="header-icon" /> Recycle Bin</h1>
          <p>Profiles deleted within the last 30 days are stored here.</p>
        </div>
        
        <div className="header-actions">
          <div className="stat-pill">
            <div className="stat-content">
              <span className="stat-count">{deletedPlayers.length}</span>
              <span className="stat-label">Items in Trash</span>
            </div>
          </div>
          
          {user.role === 'superadmin' && deletedPlayers.length > 0 && (
            <button className="btn-empty-trash premium-btn" onClick={handleEmptyTrash}>
              <Trash size={18} />
              <span>Empty Bin</span>
            </button>
          )}
        </div>
      </header>

      <div className="trash-controls glass-premium">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name or reg ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="warning-notice">
          <AlertTriangle size={16} />
          <span>Items will be permanently deleted after 30 days.</span>
        </div>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Scanning Trash...</p>
        </div>
      ) : (
        <div className="trash-grid">
          {filtered.length > 0 ? (
            filtered.map(player => (
              <div key={player.id} className="trash-card glass-premium fade-in">
                <div className="card-top">
                  <div className="player-avatar">
                    {player.photo ? (
                      <img src={player.photo} alt={player.fullName} />
                    ) : (
                      <div className="player-avatar placeholder">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <div className="player-info">
                    <h3>{player.fullName}</h3>
                    <span className="reg-id">{player.registrationNumber}</span>
                  </div>
                </div>
                <div className="card-mid">
                  <div className="info-row">
                    <Calendar size={14} /> 
                    <span>Deleted on: {new Date(player.deletedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-restore" onClick={() => handleRestore(player.id)}>
                    <RotateCcw size={16} /> Restore
                  </button>
                  <button className="btn-permanent" onClick={() => handlePermanentDelete(player.id)}>
                    <Trash size={16} /> Delete Forever
                  </button>
                  <button className="btn-view-trash" onClick={() => navigate(`/athletes/${player.id}`)}>
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-trash glass-premium">
              <Trash2 size={48} opacity={0.2} />
              <h3>Recycle Bin is Empty</h3>
              <p>No athlete profiles found in trash.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecycleBin;
