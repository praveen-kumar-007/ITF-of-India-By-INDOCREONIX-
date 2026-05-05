import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, Plus, X, Loader2, Filter, Grid, List, Search, Layers } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './GalleryManager.css';
import { GallerySkeleton } from '../components/Skeleton';

const GalleryManager = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [filter, setFilter] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    photos: []
  });

  const { showToast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/gallery`);
      const result = await response.json();
      if (result.success) {
        setPhotos(result.data);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch gallery photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 20) {
      showToast('error', 'Maximum 20 images allowed at once');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', `${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFormData({ ...formData, photos: validFiles });
      
      const previews = [];
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === validFiles.length) {
            setPreviewImages(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (formData.photos.length === 0) {
      showToast('error', 'Please select at least one photo');
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      
      formData.photos.forEach(file => {
        data.append('photos', file);
      });
      
      data.append('title', formData.title || 'Late Sh. Ram Kumar');
      data.append('category', formData.category);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/gallery`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (result.success) {
        showToast('success', `${formData.photos.length} photos added to gallery`);
        setShowUploadModal(false);
        setFormData({ title: '', category: 'General', photos: [] });
        setPreviewImages([]);
        fetchPhotos();
      } else {
        showToast('error', result.message || 'Upload failed');
      }
    } catch (error) {
      showToast('error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently remove this photo from gallery?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        showToast('success', 'Photo removed successfully');
        setPhotos(photos.filter(p => p.id !== id));
      }
    } catch (error) {
      showToast('error', 'Failed to delete photo');
    }
  };

  const categories = ['All', 'General', 'Tournament', 'Award', 'Training', 'Event'];
  const filteredPhotos = filter === 'All' ? photos : photos.filter(p => p.category === filter);

  return (
    <div className="gallery-manager animate-fade-in">
      <div className="admin-bg-accent"></div>
      
      <header className="page-header premium-header">
        <div className="header-content">
          <div className="header-badge">Admin Portal</div>
          <h1>Media Assets</h1>
          <p>Curate the visual history of ITF OF INDIA</p>
        </div>
        <div className="header-actions">
          <button className="btn-premium-action" onClick={() => setShowUploadModal(true)}>
            <Layers size={18} />
            <span>Bulk Upload</span>
          </button>
        </div>
      </header>

      <div className="gallery-controls">
        <div className="filter-group">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="view-stats">
          <span>{filteredPhotos.length} Items found</span>
        </div>
      </div>

      {loading ? (
        <GallerySkeleton />
      ) : (
        <div className="gallery-content-wrapper">
          {filteredPhotos.length === 0 ? (
            <div className="empty-state-premium">
              <div className="empty-visual">
                <div className="empty-ring"></div>
                <ImageIcon size={48} className="empty-icon" />
              </div>
              <h3>Gallery is empty</h3>
              <p>Your official media gallery hasn't been populated yet. Start by adding your first achievement photo.</p>
              <button className="btn-outline-premium" onClick={() => setShowUploadModal(true)}>
                <Plus size={20} /> Add First Photo
              </button>
            </div>
          ) : (
            <div className="gallery-grid-premium">
              {filteredPhotos.map((photo) => (
                <div key={photo.id} className="gallery-card-premium">
                  <div className="card-media">
                    <img src={photo.imageUrl} alt={photo.title} loading="lazy" />
                    <div className="card-badge">{photo.category}</div>
                    <div className="card-actions-overlay">
                      <button className="action-btn-circle delete" onClick={() => handleDelete(photo.id)} title="Delete Photo">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="card-details">
                    <h3>{photo.title}</h3>
                    <div className="card-footer">
                      <span className="date">{new Date(photo.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showUploadModal && (
        <div className="modal-overlay-premium">
          <div className="modal-content-premium bulk">
            <div className="modal-header-premium">
              <div>
                <h2>Bulk Media Upload</h2>
                <p>Select up to 20 photos at once</p>
              </div>
              <button className="close-btn-premium" onClick={() => setShowUploadModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpload}>
              <div 
                className={`upload-zone multi ${previewImages.length > 0 ? 'has-previews' : ''}`} 
                onClick={() => document.getElementById('photo-input').click()}
              >
                {previewImages.length > 0 ? (
                  <div className="multi-preview-grid">
                    {previewImages.map((src, i) => (
                      <div key={i} className="preview-mini-card">
                        <img src={src} alt="Preview" />
                      </div>
                    ))}
                    <div className="add-more-overlay">
                      <Plus size={24} />
                      <span>{previewImages.length} selected</span>
                    </div>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <div className="prompt-icon">
                      <Layers size={32} />
                    </div>
                    <div className="prompt-text">
                      <strong>Click to select multiple photos</strong>
                      <span>Supports JPG, PNG, WEBP (Max 20 files, 5MB each)</span>
                    </div>
                  </div>
                )}
                <input 
                  id="photo-input"
                  type="file" 
                  hidden 
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="premium-form-row">
                <div className="form-group-premium">
                  <label>Base Title (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Defaults to 'Late Sh. Ram Kumar'"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="form-group-premium">
                  <label>Category for All</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="General">General</option>
                    <option value="Tournament">Tournament</option>
                    <option value="Award">Award</option>
                    <option value="Training">Training</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer-premium">
                <button type="button" className="btn-text" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-premium" disabled={uploading}>
                  {uploading ? <><Loader2 className="animate-spin" size={18} /> Uploading {formData.photos.length} items...</> : `Upload ${formData.photos.length > 0 ? formData.photos.length : ''} Photos`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
