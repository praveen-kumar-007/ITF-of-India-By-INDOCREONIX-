import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Calendar, MapPin,
  CreditCard, FileText, CheckCircle, XCircle,
  ExternalLink, Clock, Shield, Award, Eye, Hash, Activity,
  Info, Briefcase, HeartPulse, Fingerprint, Trash2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './PlayerDetails.css';

import ActionModal from '../components/ActionModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PlayerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    showInput: false,
    confirmText: '',
    onConfirm: () => {},
    inputValue: ''
  });

  useEffect(() => {
    fetchPlayerDetails();
  }, [id]);

  const fetchPlayerDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setPlayer(result.data);
      } else {
        showToast(result.message || 'Player not found', 'error');
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to fetch details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (status) => {
    if (status === 'approved') {
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Approve Athlete?',
        message: `Are you sure you want to approve ${player.fullName}? This will grant them portal access.`,
        showInput: false,
        confirmText: 'Yes, Approve',
        onConfirm: () => executeStatusUpdate('approved'),
        inputValue: ''
      });
    } else if (status === 'rejected') {
      setModal({
        isOpen: true,
        type: 'danger',
        title: 'Reject Athlete?',
        message: `Please specify why you are rejecting ${player.fullName}'s application.`,
        showInput: true,
        inputPlaceholder: 'e.g., Blurred Aadhar card, Invalid payment proof...',
        confirmText: 'Confirm Rejection',
        onConfirm: (reason) => executeStatusUpdate('rejected', reason),
        inputValue: ''
      });
    }
  };

  const executeStatusUpdate = async (status, reason = '') => {
    setIsUpdating(true);
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
        setPlayer({ ...player, status, rejectionReason: reason });
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Update Successful',
          message: `The athlete's status has been successfully updated to ${status}. Notification email has been sent.`,
          showInput: false,
          confirmText: 'Done',
          onConfirm: () => setModal({ ...modal, isOpen: false }),
          inputValue: ''
        });
      } else {
        showToast(result.message || 'Update failed', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error updating status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Move to Trash?',
      message: `You are about to move ${player.fullName} to the Recycle Bin. This action can be undone later.`,
      showInput: false,
      confirmText: 'Move to Trash',
      onConfirm: executeDelete,
      inputValue: ''
    });
  };

  const executeDelete = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Moved to Trash',
          message: `${player.fullName} has been moved to the Recycle Bin successfully.`,
          showInput: false,
          confirmText: 'Go to Dashboard',
          onConfirm: () => navigate('/'),
          inputValue: ''
        });
      }
    } catch (error) {
      showToast('Delete failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {

    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Arranging Profile...</p>
      </div>
    );
  }

  if (!player) return null;

  return (
    <div className="player-detail-showcase">
      {/* Background Decor */}
      <div className="decor-blob blob-top"></div>
      <div className="decor-blob blob-bottom"></div>

      <header className="showcase-nav">
        <button className="minimal-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <div className="status-pill-minimal status-${player.status}">
          {player.status}
        </div>
      </header>

      <div className="perfect-grid">
        {/* Profile Card */}
        <div className="glass-panel profile-summary">
          <div className="compact-avatar">
            <img src={player.photo} alt={player.fullName} />
          </div>
          <div className="summary-text">
            <h2>{player.fullName}</h2>
            <span className="discipline-badge">{player.sportsDiscipline}</span>
            <div className="reg-number-tag">
              <Hash size={14} /> {player.registrationNumber}
            </div>
          </div>
        </div>

        {/* Section 1: Core Bio */}
        <div className="glass-panel info-panel">
          <div className="panel-head"><User size={16} /> Personal Info</div>
          <div className="dense-grid">
            <div className="d-cell"><label>Father</label><p>{player.fatherName}</p></div>
            <div className="d-cell"><label>DOB</label><p>{player.dob}</p></div>
            <div className="d-cell"><label>Age</label><p>{player.age}</p></div>
            <div className="d-cell"><label>Gender</label><p>{player.gender}</p></div>
            <div className="d-cell"><label>Blood</label><p>{player.bloodGroup || 'N/A'}</p></div>
            <div className="d-cell"><label>Kit Size</label><p className="accent-gold">{player.kitSize || 'Not Selected'}</p></div>
            <div className="d-cell"><label>Aadhar</label><p>{player.aadharNumber}</p></div>
          </div>
        </div>

        {/* Section 2: Contact & Background */}
        <div className="glass-panel info-panel">
          <div className="panel-head"><Mail size={16} /> Professional & Contact</div>
          <div className="dense-grid">
            <div className="d-cell"><label>Qualification</label><p>{player.qualification}</p></div>
            <div className="d-cell"><label>Father's Job</label><p>{player.fatherOccupation}</p></div>
            <div className="d-cell"><label>Phone</label><p>{player.contactNumber}</p></div>
            <div className="d-cell full"><label>Email</label><p>{player.email}</p></div>
          </div>
        </div>

        {/* Section 3: Address */}
        <div className="glass-panel info-panel">
          <div className="panel-head"><MapPin size={16} /> Address Details</div>
          <div className="dense-grid">
            <div className="d-cell"><label>Village/City</label><p>{player.villageCity}</p></div>
            <div className="d-cell"><label>Post Office</label><p>{player.po}</p></div>
            <div className="d-cell"><label>Police Station</label><p>{player.ps}</p></div>
            <div className="d-cell"><label>Block</label><p>{player.block}</p></div>
            <div className="d-cell"><label>District</label><p>{player.district}</p></div>
            <div className="d-cell"><label>State</label><p>{player.state}</p></div>
            <div className="d-cell"><label>Pin Code</label><p>{player.pinCode}</p></div>
          </div>
        </div>

        {/* Section 4: Documents */}
        <div className="glass-panel info-panel docs-panel">
          <div className="panel-head"><Shield size={16} /> Verification Assets</div>
          <div className="compact-docs">
            <div className="c-doc">
              <label>Aadhar Front</label>
              <div className="doc-box">
                <img src={player.aadharFront} alt="" />
                <a href={player.aadharFront} target="_blank" rel="noreferrer"><Eye size={16} /></a>
              </div>
            </div>
            <div className="c-doc">
              <label>Aadhar Back</label>
              <div className="doc-box">
                <img src={player.aadharBack} alt="" />
                <a href={player.aadharBack} target="_blank" rel="noreferrer"><Eye size={16} /></a>
              </div>
            </div>
            <div className="c-doc">
              <label>Signature</label>
              <div className="doc-box signature">
                <img src={player.signature} alt="" />
                <a href={player.signature} target="_blank" rel="noreferrer"><Eye size={16} /></a>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Payment */}
        <div className="glass-panel info-panel payment-panel">
          <div className="panel-head"><CreditCard size={16} /> Payment (UTR: {player.transactionId})</div>
          <div className="compact-payment">
            <div className="pay-img">
              <img src={player.paymentProof} alt="" />
              <a href={player.paymentProof} target="_blank" rel="noreferrer" className="zoom-tag">
                <ExternalLink size={12} /> Full View
              </a>
            </div>
            <div className="pay-note">
              <Info size={14} />
              <span>Verify UTR before status update.</span>
            </div>
          </div>
        </div>

        {/* Section 6: Final Action Panel */}
        <div className="glass-panel action-panel">
          <div className="panel-head"><Shield size={16} /> Administrative Decision</div>
          <p className="action-hint">Please ensure all details and payment proofs are verified before proceeding.</p>
          <div className="final-actions">
            <button
              className="action-btn approve"
              onClick={() => handleStatusUpdate('approved')}
              disabled={player.status === 'approved' || isUpdating}
            >
              <CheckCircle size={18} /> Approve
            </button>
            <button
              className="action-btn reject"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={player.status === 'rejected' || isUpdating}
            >
              <XCircle size={18} /> Reject
            </button>
            <button
              className="action-btn delete"
              onClick={handleDelete}
              disabled={isUpdating}
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
        </div>
      </div>

      <ActionModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        showInput={modal.showInput}
        inputPlaceholder={modal.inputPlaceholder}
        inputValue={modal.inputValue}
        onInputChange={(val) => setModal({ ...modal, inputValue: val })}
        confirmText={modal.confirmText}
        loading={isUpdating}
      />
    </div>
  );
};

export default PlayerDetails;
