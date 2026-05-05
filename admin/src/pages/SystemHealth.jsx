import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Database, Mail, Cloud, Server, RefreshCw, 
  AlertCircle, CheckCircle2, Clock, Cpu, HardDrive, 
  Users, Trash2, Key, Globe, TrendingUp, Bell,
  Layout, FileText, Smartphone, Monitor, Link2, Zap, Radio,
  ToggleLeft, ToggleRight, Power, MessageSquare
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './SystemHealth.css';

const SystemHealth = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [controls, setControls] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(null);
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

  const fetchControls = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings/system-control`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setControls(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch system controls');
    }
  };

  const handleToggle = async (key, currentValue) => {
    try {
      setToggling(key);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings/system-control`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: !currentValue })
      });
      const result = await response.json();
      if (result.success) {
        setControls(prev => ({ ...prev, [key]: !currentValue }));
        showToast('success', 'System control updated');
      } else {
        showToast('error', result.message);
      }
    } catch (error) {
      showToast('error', 'Failed to update system control');
    } finally {
      setToggling(null);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchControls();
    
    // Auto-refresh interval (10 seconds)
    const refreshTimer = setInterval(() => {
      fetchHealth();
      fetchControls();
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
          
          <div className="header-action-row">
            <div className="master-clock-display" style={{ width: '100%', flex: 1 }}>
              <div className="clock-label">
                <img 
                  src="https://flagcdn.com/w40/in.png" 
                  alt="India Flag" 
                  style={{ width: '24px', borderRadius: '2px', marginBottom: '4px' }}
                />
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
              className={`refresh-btn ${refreshing ? 'spinning' : ''}`} 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={22} />
              <span className="desktop-only">{refreshing ? 'Syncing...' : 'Refresh Status'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* NEW: Master System Controls */}
      <div className="health-section-title">
        <Power size={18} /> Master System Controls
      </div>
      <div className="system-control-grid">
        <div className={`control-card ${controls.mail_enabled ? 'active' : 'inactive'}`}>
          <div className="control-info">
            <div className="control-icon"><Mail size={20} /></div>
            <div>
              <h4>Mail Service</h4>
              <p>{controls.mail_enabled ? 'Automated Emails Enabled' : 'Mail Gateway Suspended'}</p>
            </div>
          </div>
          <button 
            className="toggle-btn" 
            onClick={() => handleToggle('mail_enabled', controls.mail_enabled)}
            disabled={toggling === 'mail_enabled'}
          >
            {controls.mail_enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>

        <div className={`control-card ${controls.registration_enabled ? 'active' : 'inactive'}`}>
          <div className="control-info">
            <div className="control-icon"><Zap size={20} /></div>
            <div>
              <h4>Registration Portal</h4>
              <p>{controls.registration_enabled ? 'Public Registrations Active' : 'Portal Maintenance Mode'}</p>
            </div>
          </div>
          <button 
            className="toggle-btn" 
            onClick={() => handleToggle('registration_enabled', controls.registration_enabled)}
            disabled={toggling === 'registration_enabled'}
          >
            {controls.registration_enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>

        <div className={`control-card ${controls.contact_enabled ? 'active' : 'inactive'}`}>
          <div className="control-info">
            <div className="control-icon"><MessageSquare size={20} /></div>
            <div>
              <h4>Contact Gateway</h4>
              <p>{controls.contact_enabled ? 'Public Enquiries Active' : 'Gateway Offline'}</p>
            </div>
          </div>
          <button 
            className="toggle-btn" 
            onClick={() => handleToggle('contact_enabled', controls.contact_enabled)}
            disabled={toggling === 'contact_enabled'}
          >
            {controls.contact_enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>

        <div className={`control-card ${controls.gallery_enabled ? 'active' : 'inactive'}`}>
          <div className="control-info">
            <div className="control-icon"><Globe size={20} /></div>
            <div>
              <h4>Public Gallery</h4>
              <p>{controls.gallery_enabled ? 'Media Feed Online' : 'Media Feed Hidden'}</p>
            </div>
          </div>
          <button 
            className="toggle-btn" 
            onClick={() => handleToggle('gallery_enabled', controls.gallery_enabled)}
            disabled={toggling === 'gallery_enabled'}
          >
            {controls.gallery_enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>

        <div className={`control-card ${controls.news_enabled ? 'active' : 'inactive'}`}>
          <div className="control-info">
            <div className="control-icon"><Bell size={20} /></div>
            <div>
              <h4>News & Bulletins</h4>
              <p>{controls.news_enabled ? 'News Archive Active' : 'News Archive Locked'}</p>
            </div>
          </div>
          <button 
            className="toggle-btn" 
            onClick={() => handleToggle('news_enabled', controls.news_enabled)}
            disabled={toggling === 'news_enabled'}
          >
            {controls.news_enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
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
            <div className="stat-row"><Cpu size={16} /> <span>Engine:</span> <strong>Node {data?.nodeVersion || '...'}</strong></div>
            <div className="stat-row"><HardDrive size={16} /> <span>RAM:</span> <strong>{data?.memory?.rss ? formatMemory(data.memory.rss) : '...'}</strong></div>
          </div>
          <div className="card-footer">
            <span>Operating System: {data?.platform || '...'}</span>
          </div>
        </div>
      </div>

      {/* NEW: Content Integrity Monitor */}
      <div className="health-section-title">
        <Database size={18} /> Content Integrity Monitor
      </div>
      <div className="integrity-grid">
        <div className={`integrity-card ${data?.integrity?.gallery?.status || 'checking'}`}>
          <div className="integrity-header">
            <Globe size={20} />
            <span>Gallery Module</span>
          </div>
          <div className="integrity-body">
            <div className="integrity-status">
              <CheckCircle2 size={14} /> {data?.integrity?.gallery?.message || 'Validating connectivity...'}
            </div>
            <div className="integrity-count">
              <strong>{data?.integrity?.gallery?.count || 0}</strong> Assets Linked
            </div>
          </div>
        </div>

        <div className={`integrity-card ${data?.integrity?.news?.status || 'checking'}`}>
          <div className="integrity-header">
            <TrendingUp size={20} />
            <span>News Module</span>
          </div>
          <div className="integrity-body">
            <div className="integrity-status">
              <CheckCircle2 size={14} /> {data?.integrity?.news?.message || 'Synchronizing stories...'}
            </div>
            <div className="integrity-count">
              <strong>{data?.integrity?.news?.count || 0}</strong> Active Stories
            </div>
          </div>
        </div>

        <div className={`integrity-card ${data.integrity?.notices?.status}`}>
          <div className="integrity-header">
            <Bell size={20} />
            <span>Notice Board</span>
          </div>
          <div className="integrity-body">
            <div className="integrity-status">
              <CheckCircle2 size={14} /> {data.integrity?.notices?.message}
            </div>
            <div className="integrity-count">
              <strong>{data.integrity?.notices?.count}</strong> Live Alerts
            </div>
          </div>
        </div>

        <div className={`integrity-card ${data.integrity?.contact?.status}`}>
          <div className="integrity-header">
            <Mail size={20} />
            <span>Contact Link</span>
          </div>
          <div className="integrity-body">
            <div className="integrity-status">
              <CheckCircle2 size={14} /> {data.integrity?.contact?.message}
            </div>
            <div className="integrity-count">
              <strong>{data.integrity?.contact?.count}</strong> Enquiries Received
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Global Page Connectivity */}
      <div className="health-section-title">
        <Radio size={18} /> Global Page Connectivity
      </div>
      <div className="connectivity-map">
        {data.pageConnectivity && Object.entries(data.pageConnectivity).map(([key, page]) => (
          <div key={key} className={`page-status-card ${page.status}`}>
            <div className="page-icon">
              {key === 'home' && <Monitor size={20} />}
              {key === 'about' && <FileText size={20} />}
              {key === 'gallery' && <Globe size={20} />}
              {key === 'news' && <TrendingUp size={20} />}
              {key === 'registration' && <Zap size={20} />}
              {key === 'contact' && <Mail size={20} />}
            </div>
            <div className="page-info">
              <h4>{page.title}</h4>
              <div className="status-indicator">
                <div className="pulse-dot"></div>
                <span>{page.status === 'healthy' ? 'Online' : 'Link Down'}</span>
              </div>
            </div>
            <a href={`${import.meta.env.VITE_FRONT_URL}${page.link}`} target="_blank" rel="noreferrer" className="visit-link">
              <Link2 size={14} />
            </a>
          </div>
        ))}
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
