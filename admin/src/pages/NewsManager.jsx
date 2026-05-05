import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Calendar, 
  Tag, 
  FileText, 
  Search,
  Bell
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './NewsManager.css';
import { TableSkeleton } from '../components/Skeleton';

const NewsManager = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [filter, setFilter] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Latest',
    date: new Date().toISOString().split('T')[0],
    image: null
  });

  const { showToast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/news`);
      const result = await response.json();
      if (result.success) {
        setNews(result.data);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch news updates');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Image size should be less than 5MB');
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast('error', 'Title and Content are required');
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('category', formData.category);
      data.append('date', formData.date);
      if (formData.image) {
        data.append('image', formData.image);
      }

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
        showToast('success', 'News item published successfully');
        setShowModal(false);
        resetForm();
        fetchNews();
      } else {
        showToast('error', result.message || 'Failed to publish');
      }
    } catch (error) {
      showToast('error', 'Publishing failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this news update permanently?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        showToast('success', 'News item removed');
        setNews(news.filter(n => n.id !== id));
      }
    } catch (error) {
      showToast('error', 'Failed to delete news item');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'Latest',
      date: new Date().toISOString().split('T')[0],
      image: null
    });
    setPreviewImage(null);
  };

  const categories = ['All', 'Latest', 'Tournament', 'Event', 'Notice', 'Announcement'];
  const filteredNews = filter === 'All' ? news : news.filter(n => n.category === filter);

  return (
    <div className="news-manager animate-fade-in">
      <div className="admin-bg-accent"></div>
      
      <header className="page-header premium-header">
        <div className="header-content">
          <div className="header-badge">Admin Portal</div>
          <h1>Official News & Notices</h1>
          <p>Communicate important updates to the ITF community</p>
        </div>
        <div className="header-actions">
          <button className="btn-premium-action" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            <span>Post New Update</span>
          </button>
        </div>
      </header>

      <div className="news-controls">
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
          <span>{filteredNews.length} Updates found</span>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="news-content-wrapper">
          {filteredNews.length === 0 ? (
            <div className="empty-state-premium">
              <div className="empty-visual">
                <div className="empty-ring"></div>
                <Bell size={48} className="empty-icon" />
              </div>
              <h3>No news items found</h3>
              <p>Your news board is currently quiet. Start by posting an important announcement or event update.</p>
              <button className="btn-outline-premium" onClick={() => setShowModal(true)}>
                <Plus size={20} /> Create First Post
              </button>
            </div>
          ) : (
            <div className="news-list-premium">
              {filteredNews.map((item) => (
                <div key={item.id} className="news-card-premium">
                  <div className="news-card-image">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} />
                    ) : (
                      <div className="no-image-placeholder">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <div className="news-category-badge">{item.category}</div>
                  </div>
                  <div className="news-card-info">
                    <div className="news-card-meta">
                      <span className="news-date">
                        <Calendar size={14} />
                        {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.content.substring(0, 120)}...</p>
                    <div className="news-card-actions">
                      <button className="delete-btn-news" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay-premium">
          <div className="modal-content-premium news-modal">
            <div className="modal-header-premium">
              <div>
                <h2>Create News Update</h2>
                <p>Fill in the details to publish an official bulletin</p>
              </div>
              <button className="close-btn-premium" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-grid-news">
                <div className="form-left-news">
                  <div className="form-group-premium">
                    <label>Bulletin Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. State Championship 2024 Results"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-row-news">
                    <div className="form-group-premium">
                      <label>Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="Latest">Latest News</option>
                        <option value="Tournament">Tournament</option>
                        <option value="Event">Event</option>
                        <option value="Notice">Notice</option>
                        <option value="Announcement">Announcement</option>
                      </select>
                    </div>
                    <div className="form-group-premium">
                      <label>Publication Date</label>
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group-premium">
                    <label>Content / Description</label>
                    <textarea 
                      rows="6"
                      placeholder="Enter the full news details or announcement text..."
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="form-right-news">
                  <label className="image-label">Banner Image (Optional)</label>
                  <div 
                    className={`news-upload-zone ${previewImage ? 'has-preview' : ''}`} 
                    onClick={() => document.getElementById('news-image-input').click()}
                  >
                    {previewImage ? (
                      <div className="news-preview-container">
                        <img src={previewImage} alt="Preview" />
                        <div className="preview-overlay-text">Click to change</div>
                      </div>
                    ) : (
                      <div className="news-upload-prompt">
                        <ImageIcon size={40} />
                        <strong>Upload Media</strong>
                        <span>JPG, PNG, WEBP (Max 5MB)</span>
                      </div>
                    )}
                    <input 
                      id="news-image-input"
                      type="file" 
                      hidden 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-premium">
                <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-premium" disabled={uploading}>
                  {uploading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : 'Publish Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManager;
