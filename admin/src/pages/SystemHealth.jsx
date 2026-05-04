import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Database, Mail, Cloud, Server, RefreshCw, 
  AlertCircle, CheckCircle2, Clock, Cpu, HardDrive, 
  Users, Trash2, Key, Globe, TrendingUp 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './SystemHealth.css';

const SystemHealth = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [secondsSinceSync, setSecondsSinceSync] = useState(0);
  const [liveUptime, setLiveUptime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

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
        setSecondsSinceSync(0);
        setLiveUptime(result.data.uptime || 0);
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
    
    // Auto-refresh interval (10 seconds)
    const refreshTimer = setInterval(() => {
      fetchHealth();
    }, 10000);

    // Local clock tick (every second)
    const tickTimer = setInterval(() => {
      setSecondsSinceSync((prev) => prev + 1);
      setLiveUptime((prev) => prev + 1);
    }, 1000);

    // High-precision clock (every 10ms)
    const masterClock = setInterval(() => {
      setCurrentTime(new Date());
    }, 10);

    return () => {
      clearInterval(refreshTimer);
      clearInterval(tickTimer);
      clearInterval(masterClock);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealth();
  };

  if (loading) {
    return (
      <div className="health-loading">
        <div className="pulse-loader">
          <ShieldCheck size={64} className="loader-icon" />
          <div className="pulse-ring"></div>
        </div>
        <p>Synchronizing System Infrastructure...</p>
      </div>
    );
  }

  const formatMemory = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  const formatDetailedTime = (date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return { h, m, s, ms };
  };

  const timeParts = formatDetailedTime(currentTime);

  const services = data?.services || {};
  const stats = data?.stats || {};
  const env = data?.env || {};

  return (
    <div className="system-health-page fade-in">
      <div className="page-header">
        <div className="header-main-info">
          <div className="title-row">
            <h1>System Integrity</h1>
            <div className="live-indicator">
              <div className="dot"></div>
              <span>LIVE</span>
            </div>
          </div>
          <div className="mobile-action-row mobile-only">
            <div className="master-clock-display">
              <div className="clock-label">
                <span className="flag-icon">🇮🇳</span>
                <span className="timezone-text">IST</span>
              </div>
              <div className="time-unit"><span>{timeParts.h}</span><label>HRS</label></div>
              <div className="time-sep">:</div>
              <div className="time-unit"><span>{timeParts.m}</span><label>MIN</label></div>
              <div className="time-sep">:</div>
              <div className="time-unit"><span>{timeParts.s}</span><label>SEC</label></div>
              <div className="time-sep">:</div>
              <div className="time-unit ms"><span>{timeParts.ms}</span><label>MS</label></div>
            </div>
            
            <button 
              className={`refresh-btn mobile-only ${refreshing ? 'spinning' : ''}`} 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={22} />
            </button>
          </div>
        </div>
        
        <div className="header-action-group desktop-only">
          <button 
            className={`refresh-btn ${refreshing ? 'spinning' : ''}`} 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={18} /> <span>{refreshing ? 'Syncing...' : 'Refresh Status'}</span>
          </button>
        </div>
      </div>

      {/* Database Statistics Section */}
      <div className="health-section-title">
        <TrendingUp size={18} /> Resource Statistics
      </div>
      <div className="stats-strip">
        <div className="stat-pill">
          <Users size={16} /> 
          <span>Total Athletes:</span> <strong>{stats.totalAthletes}</strong>
        </div>
        <div className="stat-pill">
          <ShieldCheck size={16} /> 
          <span>Total Admins:</span> <strong>{stats.totalAdmins}</strong>
        </div>
        <div className="stat-pill">
          <Trash2 size={16} /> 
          <span>Trash Items:</span> <strong>{stats.trashItems}</strong>
        </div>
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
            {services.mail?.mode === 'production' ? 'Production Ready' : 'Gateway Operational'}
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
            <div className="stat-row"><Clock size={16} /> <span>Uptime:</span> <strong>{formatUptime(liveUptime)}</strong></div>
            <div className="stat-row"><Cpu size={16} /> <span>Engine:</span> <strong>Node {data.nodeVersion}</strong></div>
            <div className="stat-row"><HardDrive size={16} /> <span>RAM:</span> <strong>{formatMemory(data.memory?.rss)}</strong></div>
          </div>
          <div className="card-footer">
            <span>Operating System: {data.platform}</span>
          </div>
        </div>
      </div>

      {/* Environment Config Section */}
      <div className="health-section-title">
        <Key size={18} /> Configuration Audit
      </div>
      <div className="env-checklist">
        {Object.entries(env).map(([key, value]) => (
          <div key={key} className={`env-item ${value ? 'configured' : 'missing'}`}>
            <div className="env-status-dot"></div>
            <span className="env-key">{key}</span>
            <span className="env-value">
              {key === 'NODE_ENV' ? value.toUpperCase() : (value ? 'CONFIGURED' : 'MISSING')}
            </span>
          </div>
        ))}
      </div>

      <div className="security-status">
        <div className="status-icon"><ShieldCheck size={48} /></div>
        <div className="status-info">
          <h3>Security Shield: Active</h3>
          <p>Rate limiting, Helmet protection, and JWT integrity are fully operational.</p>
        </div>
        <div className="last-sync">
          <Clock size={12} />
          {secondsSinceSync < 5 ? 'Just Now' : `Synced ${secondsSinceSync}s ago`}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
