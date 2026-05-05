import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Calendar, MapPin,
  CreditCard, FileText, CheckCircle, XCircle,
  ExternalLink, Clock, Shield, Award, Eye, Hash, Activity,
  Info, Briefcase, HeartPulse, Fingerprint, Trash2, Cloud, Loader2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './PlayerDetails.css';

import ActionModal from '../components/ActionModal';
import { PlayerDetailsSkeleton } from '../components/Skeleton';

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newFiles, setNewFiles] = useState({}); // Stores File objects for upload
  const [previews, setPreviews] = useState({}); // Stores temp URLs for preview

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
        setEditData(result.data);
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

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData(player);
      setNewFiles({});
      setPreviews({});
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setNewFiles(prev => ({ ...prev, [field]: file }));
      setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const saveChanges = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Append all text data
      Object.keys(editData).forEach(key => {
        if (typeof editData[key] !== 'object' || editData[key] === null) {
          formData.append(key, editData[key]);
        }
      });

      // Append new files
      Object.keys(newFiles).forEach(key => {
        formData.append(key, newFiles[key]);
      });

      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        showToast('Profile updated successfully', 'success');
        setPlayer(result.data);
        setIsEditing(false);
        setNewFiles({});
        setPreviews({});
      } else {
        showToast(result.message || 'Update failed', 'error');
      }
    } catch (error) {
      showToast('Error saving changes', 'error');
    } finally {
      setIsUpdating(false);
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
    return <PlayerDetailsSkeleton />;
  }

  if (!player) return null;

  return (
    <div className={`player-detail-showcase ${isEditing ? 'editing-active' : ''}`}>
      <div className="decor-blob blob-top"></div>
      <div className="decor-blob blob-bottom"></div>

      <header className="showcase-nav">
        <div className="nav-left">
          <button className="minimal-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        
        <div className="nav-right-actions">
          <div className={`status-pill-minimal status-${player.status}`}>
            {player.status}
          </div>
        </div>
      </header>

      <div className="perfect-grid">
        <div className="glass-panel profile-summary">
          <div className="compact-avatar edit-target">
            <img src={previews.photo || player.photo} alt={player.fullName} />
            {isEditing && (
              <label className="image-edit-overlay">
                <Cloud size={24} />
                <span>Replace</span>
                <input type="file" hidden onChange={(e) => handleFileChange(e, 'photo')} />
              </label>
            )}
          </div>
          <div className="summary-text">
            {isEditing ? (
              <input 
                name="fullName" 
                className="edit-input-large" 
                value={editData.fullName} 
                onChange={handleInputChange} 
              />
            ) : (
              <h2>{player.fullName}</h2>
            )}
            
            {isEditing ? (
              <select 
                name="sportsDiscipline" 
                className="edit-select" 
                value={editData.sportsDiscipline} 
                onChange={handleInputChange}
              >
                <option value="Karate">Karate</option>
                <option value="Taekwondo">Taekwondo</option>
                <option value="Judo">Judo</option>
                <option value="Wrestling">Wrestling</option>
                <option value="Boxing">Boxing</option>
                <option value="Kickboxing">Kickboxing</option>
                <option value="Mixed Martial Arts">Mixed Martial Arts</option>
                <option value="Kabaddi">Kabaddi</option>
                <option value="Football">Football</option>
                <option value="Volleyball">Volleyball</option>
                <option value="Basketball">Basketball</option>
                <option value="Cricket">Cricket</option>
                <option value="Handball">Handball</option>
                <option value="Kho-Kho">Kho-Kho</option>
                <option value="Athletics">Athletics</option>
                <option value="Archery">Archery</option>
                <option value="Shooting">Shooting</option>
                <option value="Fencing">Fencing</option>
                <option value="Badminton">Badminton</option>
                <option value="Table Tennis">Table Tennis</option>
                <option value="Yoga Sports">Yoga Sports</option>
              </select>
            ) : (
              <span className="discipline-badge">{player.sportsDiscipline}</span>
            )}

            <div className="reg-number-tag">
              <Hash size={14} /> {player.registrationNumber}
            </div>
          </div>
        </div>

        <div className="glass-panel info-panel">
          <div className="panel-head"><User size={16} /> Personal Info</div>
          <div className="dense-grid">
            <div className="d-cell">
              <label>Father</label>
              {isEditing ? <input name="fatherName" className="edit-input" value={editData.fatherName} onChange={handleInputChange} /> : <p>{player.fatherName}</p>}
            </div>
            <div className="d-cell">
              <label>DOB</label>
              {isEditing ? <input type="date" name="dob" className="edit-input" value={editData.dob} onChange={handleInputChange} /> : <p>{player.dob}</p>}
            </div>
            <div className="d-cell">
              <label>Age</label>
              {isEditing ? <input type="number" name="age" className="edit-input" value={editData.age} onChange={handleInputChange} /> : <p>{player.age}</p>}
            </div>
            <div className="d-cell">
              <label>Gender</label>
              {isEditing ? (
                <select name="gender" className="edit-select" value={editData.gender} onChange={handleInputChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : <p>{player.gender}</p>}
            </div>
            <div className="d-cell">
              <label>Blood</label>
              {isEditing ? <input name="bloodGroup" className="edit-input" value={editData.bloodGroup} onChange={handleInputChange} /> : <p>{player.bloodGroup || 'N/A'}</p>}
            </div>
            <div className="d-cell">
              <label>Kit Size</label>
              {isEditing ? (
                <select name="kitSize" className="edit-select" value={editData.kitSize} onChange={handleInputChange}>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              ) : <p className="accent-gold">{player.kitSize || 'Not Selected'}</p>}
            </div>
            <div className="d-cell">
              <label>Aadhar</label>
              {isEditing ? <input name="aadharNumber" className="edit-input" value={editData.aadharNumber} onChange={handleInputChange} /> : <p>{player.aadharNumber}</p>}
            </div>
          </div>
        </div>

        <div className="glass-panel info-panel">
          <div className="panel-head"><Mail size={16} /> Professional & Contact</div>
          <div className="dense-grid">
            <div className="d-cell">
              <label>Qualification</label>
              {isEditing ? <input name="qualification" className="edit-input" value={editData.qualification} onChange={handleInputChange} /> : <p>{player.qualification}</p>}
            </div>
            <div className="d-cell">
              <label>Father's Job</label>
              {isEditing ? <input name="fatherOccupation" className="edit-input" value={editData.fatherOccupation} onChange={handleInputChange} /> : <p>{player.fatherOccupation}</p>}
            </div>
            <div className="d-cell">
              <label>Phone</label>
              {isEditing ? <input name="contactNumber" className="edit-input" value={editData.contactNumber} onChange={handleInputChange} /> : <p>{player.contactNumber}</p>}
            </div>
            <div className="d-cell">
              <label>Parent Phone</label>
              {isEditing ? <input name="parentContactNumber" className="edit-input" value={editData.parentContactNumber} onChange={handleInputChange} /> : <p className="accent-gold">{player.parentContactNumber || 'N/A'}</p>}
            </div>
            <div className="d-cell full">
              <label>Email</label>
              {isEditing ? <input name="email" className="edit-input" value={editData.email} onChange={handleInputChange} /> : <p>{player.email}</p>}
            </div>
          </div>
        </div>

        <div className="glass-panel info-panel">
          <div className="panel-head"><MapPin size={16} /> Address Details</div>
          <div className="dense-grid">
            <div className="d-cell">
              <label>Village/City</label>
              {isEditing ? <input name="villageCity" className="edit-input" value={editData.villageCity} onChange={handleInputChange} /> : <p>{player.villageCity}</p>}
            </div>
            <div className="d-cell">
              <label>Post Office</label>
              {isEditing ? <input name="po" className="edit-input" value={editData.po} onChange={handleInputChange} /> : <p>{player.po}</p>}
            </div>
            <div className="d-cell">
              <label>Police Station</label>
              {isEditing ? <input name="ps" className="edit-input" value={editData.ps} onChange={handleInputChange} /> : <p>{player.ps}</p>}
            </div>
            <div className="d-cell">
              <label>Block</label>
              {isEditing ? <input name="block" className="edit-input" value={editData.block} onChange={handleInputChange} /> : <p>{player.block}</p>}
            </div>
            <div className="d-cell">
              <label>District</label>
              {isEditing ? <input name="district" className="edit-input" value={editData.district} onChange={handleInputChange} /> : <p>{player.district}</p>}
            </div>
            <div className="d-cell">
              <label>State</label>
              {isEditing ? <input name="state" className="edit-input" value={editData.state} onChange={handleInputChange} /> : <p>{player.state}</p>}
            </div>
            <div className="d-cell">
              <label>Pin Code</label>
              {isEditing ? <input name="pinCode" className="edit-input" value={editData.pinCode} onChange={handleInputChange} /> : <p>{player.pinCode}</p>}
            </div>
          </div>
        </div>

        <div className="glass-panel info-panel docs-panel">
          <div className="panel-head"><Shield size={16} /> Verification Assets</div>
          <div className="compact-docs">
            {['aadharFront', 'aadharBack', 'signature'].map(docField => (
              <div key={docField} className="c-doc">
                <label>{docField.replace(/([A-Z])/g, ' $1')}</label>
                <div className="doc-box edit-target">
                  <img src={previews[docField] || player[docField]} alt="" />
                  {isEditing ? (
                    <label className="image-edit-overlay">
                      <ExternalLink size={20} />
                      <span>Update</span>
                      <input type="file" hidden onChange={(e) => handleFileChange(e, docField)} />
                    </label>
                  ) : (
                    <a href={player[docField]} target="_blank" rel="noreferrer"><Eye size={16} /></a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel info-panel payment-panel">
          <div className="panel-head"><CreditCard size={16} /> Payment (UTR: {player.transactionId})</div>
          <div className="compact-payment">
            <div className="pay-img edit-target">
              <img src={previews.paymentProof || player.paymentProof} alt="" />
              {isEditing ? (
                <label className="image-edit-overlay">
                  <Cloud size={24} />
                  <span>Update Proof</span>
                  <input type="file" hidden onChange={(e) => handleFileChange(e, 'paymentProof')} />
                </label>
              ) : (
                <a href={player.paymentProof} target="_blank" rel="noreferrer" className="zoom-tag">
                  <ExternalLink size={12} /> Full View
                </a>
              )}
            </div>
            <div className="pay-note">
              {isEditing ? (
                <div className="form-group-premium" style={{ width: '100%' }}>
                  <label>Transaction ID / UTR</label>
                  <input 
                    name="transactionId" 
                    className="edit-input" 
                    value={editData.transactionId} 
                    onChange={handleInputChange} 
                  />
                </div>
              ) : (
                <>
                  <Info size={14} />
                  <span>Verify UTR before status update.</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel action-panel">
          <div className="panel-head"><Shield size={16} /> Administrative Decision</div>
          
          {!isEditing ? (
            <>
              <p className="action-hint">Please ensure all details and payment proofs are verified before proceeding.</p>
              <div className="final-actions-grid">
                <button
                  className="action-btn approve"
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={player.status === 'approved' || isUpdating}
                >
                  <CheckCircle size={18} /> <span>Approve</span>
                </button>
                <button
                  className="action-btn edit-main"
                  onClick={handleEditToggle}
                >
                  <Award size={18} /> <span>Edit Profile</span>
                </button>
                <button
                  className="action-btn reject"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={player.status === 'rejected' || isUpdating}
                >
                  <XCircle size={18} /> <span>Reject</span>
                </button>
                <button
                  className="action-btn delete"
                  onClick={handleDelete}
                  disabled={isUpdating}
                >
                  <Trash2 size={18} /> <span>Delete</span>
                </button>
              </div>
            </>
          ) : (
            <div className="edit-decision-actions">
              <p className="action-hint">Review your changes carefully before saving the profile.</p>
              <div className="final-actions-grid">
                <button className="action-btn cancel-main" onClick={handleEditToggle}>
                  <XCircle size={18} /> <span>Cancel</span>
                </button>
                <button className="action-btn save-main" onClick={saveChanges} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}
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
