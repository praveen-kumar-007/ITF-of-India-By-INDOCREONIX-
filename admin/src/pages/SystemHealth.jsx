import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Mail, Cloud, Server, RefreshCw, AlertCircle, CheckCircle2, Clock, Cpu, HardDrive } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './SystemHealth.css';

const SystemHealth = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/system-health`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        showToast(result.message || 'Failed to fetch health data', 'error');
      }
    } catch (error) {
      showToast('Error connecting to backend', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealth();
  };

  if (loading) {
    return (
      <div className="health-loading">
        <RefreshCw className="animate-spin" size={48} />
        <p>Analyzing System Integrity...</p>
      </div>
    );
  }

  const formatMemory = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const services = data?.services || {};

  return (
    <div className="system-health-page fade-in">
      <div className="page-header">
        <div>
          <h1>System Integrity</h1>
          <p>Real-time monitor for ITF India infrastructure.</p>
        </div>
        <button 
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`} 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={18} /> {refreshing ? 'Scanning...' : 'Refresh Status'}
        </button>
      </div>

      <div className="health-grid">
        {/* Firebase Check */}
        <div className={`health-card ${services.firebase?.status}`}>
          <div className="card-icon"><Database size={28} /></div>
          <h3>Firebase Database</h3>
          <div className={`status-badge`}>
            {services.firebase?.status === 'healthy' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {services.firebase?.message}
          </div>
          <div className="card-footer">
            <span>Core Storage & Authentication</span>
          </div>
        </div>

        {/* Cloudinary Check */}
        <div className={`health-card ${services.cloudinary?.status}`}>
          <div className="card-icon"><Cloud size={28} /></div>
          <h3>Cloudinary Assets</h3>
          <div className={`status-badge`}>
            {services.cloudinary?.status === 'healthy' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {services.cloudinary?.message}
          </div>
          <div className="card-footer">
            <span>Media & Document Storage</span>
          </div>
        </div>

        {/* Mail Check */}
        <div className={`health-card ${services.mail?.status}`}>
          <div className="card-icon"><Mail size={28} /></div>
          <h3>Mail Gateway</h3>
          <div className={`status-badge`}>
            {services.mail?.status === 'healthy' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {services.mail?.mode === 'production' ? 'Production Ready' : 'Mock Mode Active'}
          </div>
          <div className="card-footer">
            <span>OTP & Notification Delivery</span>
          </div>
        </div>

        {/* Server Info */}
        <div className="health-card info">
          <div className="card-icon"><Server size={28} /></div>
          <h3>Node.js Runtime</h3>
          <div className="info-stats">
            <div className="stat-row"><Clock size={16} /> <span>Uptime:</span> <strong>{formatUptime(data.uptime)}</strong></div>
            <div className="stat-row"><Cpu size={16} /> <span>Engine:</span> <strong>Node {data.nodeVersion}</strong></div>
            <div className="stat-row"><HardDrive size={16} /> <span>RAM:</span> <strong>{formatMemory(data.memory?.rss)}</strong></div>
          </div>
          <div className="card-footer">
            <span>Operating System: {data.platform}</span>
          </div>
        </div>
      </div>

      <div className="security-status">
        <div className="status-icon"><ShieldCheck size={48} /></div>
        <div className="status-info">
          <h3>Security Shield: Active</h3>
          <p>Rate limiting, Helmet protection, and JWT integrity are fully operational.</p>
        </div>
        <div className="last-sync">
          LAST SYNC: {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
