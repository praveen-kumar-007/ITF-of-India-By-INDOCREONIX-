import React, { useState, useEffect } from 'react';
import { 
  Trash2, RefreshCw, Trash, Search, Filter, 
  Calendar, User, AlertTriangle, Eye, ArrowLeft
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import './RecycleBin.css';
import { TableSkeleton } from '../components/Skeleton';

import ActionModal from '../components/ActionModal';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const RecycleBin = () => {
  const [deletedPlayers, setDeletedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Custom Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Confirm',
    onConfirm: () => {}
  });

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

  const handleRestore = (id, name) => {
    setActionModal({
      isOpen: true,
      title: 'Restore Profile?',
      message: `Are you sure you want to restore the athlete profile for ${name}?`,
      type: 'info',
      confirmText: 'Yes, Restore',
      onConfirm: () => executeRestore(id)
    });
  };

  const executeRestore = async (id) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/${id}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        fetchDeletedPlayers();
        setActionModal({
          isOpen: true,
          title: 'Restored',
          message: 'Athlete profile has been restored to pending status.',
          type: 'success',
          confirmText: 'Done',
          onConfirm: () => setActionModal({ ...actionModal, isOpen: false })
        });
      }
    } catch (error) {
      showToast('Restore failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDelete = (id, name) => {
    setActionModal({
      isOpen: true,
      title: 'Permanent Delete?',
      message: `WARNING: This will permanently remove ${name}'s data and files from the database and Cloudinary. This action is irreversible.`,
      type: 'danger',
      confirmText: 'Delete Forever',
      onConfirm: () => executePermanentDelete(id)
    });
  };

  const executePermanentDelete = async (id) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/${id}/permanent`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        fetchDeletedPlayers();
        setActionModal({
          isOpen: true,
          title: 'Permanently Deleted',
          message: 'The record and all associated files have been removed forever.',
          type: 'success',
          confirmText: 'Acknowledged',
          onConfirm: () => setActionModal({ ...actionModal, isOpen: false })
        });
      }
    } catch (error) {
      showToast('Permanent deletion failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmptyTrash = () => {
    setActionModal({
      isOpen: true,
      title: 'Empty Recycle Bin?',
      message: `CRITICAL WARNING: This will permanently delete ALL items in the recycle bin and their associated files. This cannot be undone.`,
      type: 'danger',
      confirmText: 'Empty Bin Now',
      onConfirm: executeEmptyTrash
    });
  };

  const executeEmptyTrash = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/empty-trash`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        fetchDeletedPlayers();
        setActionModal({
          isOpen: true,
          title: 'Bin Emptied',
          message: 'All items have been cleared from the Recycle Bin.',
          type: 'success',
          confirmText: 'Done',
          onConfirm: () => setActionModal({ ...actionModal, isOpen: false })
        });
      }
    } catch (error) {
      showToast('Action failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = deletedPlayers.filter(p => 
    p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <TableSkeleton />
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
                      <div className="avatar-placeholder">
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
                    <button className="premium-btn btn-gradient-green btn-restore" onClick={() => handleRestore(player.id, player.fullName)} title="Restore Athlete">
                        <RefreshCw size={16} /> Restore
                    </button>
                    <button className="premium-btn btn-gradient-red btn-permanent" onClick={() => handlePermanentDelete(player.id, player.fullName)} title="Delete Permanently">
                        <Trash2 size={16} /> Delete
                    </button>
                    <button className="premium-btn btn-gradient-slate btn-view-trash" onClick={() => navigate(`/athletes/${player.id}`)} title="View Profile">
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

      <ActionModal 
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ ...actionModal, isOpen: false })}
        onConfirm={actionModal.onConfirm}
        title={actionModal.title}
        message={actionModal.message}
        type={actionModal.type}
        confirmText={actionModal.confirmText}
        loading={isProcessing}
      />
    </div>
  );
};

export default RecycleBin;
