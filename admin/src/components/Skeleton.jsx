import React from 'react';
import './Skeleton.css';

export const DashboardSkeleton = () => (
  <div className="skeleton-dashboard animate-fade-in" style={{ padding: '2.5rem' }}>
    <div className="skeleton-shimmer" style={{ height: '280px', borderRadius: '40px', marginBottom: '3rem' }}></div>
    <div className="skeleton-dashboard-grid">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-metric-card">
          <div className="skeleton-shimmer icon"></div>
          <div className="skeleton-shimmer line"></div>
          <div className="skeleton-shimmer value"></div>
        </div>
      ))}
    </div>
    <div className="skeleton-table">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton-shimmer skeleton-avatar"></div>
          <div className="skeleton-text-group">
            <div className="skeleton-shimmer skeleton-line medium"></div>
            <div className="skeleton-shimmer skeleton-line short"></div>
          </div>
          <div className="skeleton-shimmer" style={{ width: '100px', height: '24px', borderRadius: '100px' }}></div>
        </div>
      ))}
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="skeleton-table-page animate-fade-in" style={{ padding: '2.5rem' }}>
    <div className="skeleton-shimmer" style={{ height: '120px', borderRadius: '24px', marginBottom: '2rem' }}></div>
    <div className="skeleton-table">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton-shimmer skeleton-avatar"></div>
          <div className="skeleton-text-group">
            <div className="skeleton-shimmer skeleton-line medium"></div>
            <div className="skeleton-shimmer skeleton-line short"></div>
          </div>
          <div className="skeleton-shimmer" style={{ width: '80px', height: '20px', borderRadius: '4px' }}></div>
          <div className="skeleton-shimmer" style={{ width: '80px', height: '20px', borderRadius: '4px' }}></div>
        </div>
      ))}
    </div>
  </div>
);

export const PlayerDetailsSkeleton = () => (
  <div className="skeleton-player-details-page animate-fade-in" style={{ padding: '2.5rem' }}>
    <div className="skeleton-profile-header">
      <div className="skeleton-shimmer" style={{ width: '120px', height: '120px', borderRadius: '32px' }}></div>
      <div className="skeleton-text-group">
        <div className="skeleton-shimmer" style={{ width: '300px', height: '32px', borderRadius: '8px' }}></div>
        <div className="skeleton-shimmer" style={{ width: '150px', height: '20px', borderRadius: '4px' }}></div>
      </div>
    </div>
    <div className="skeleton-player-details" style={{ marginTop: '2rem' }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton-panel">
          <div className="skeleton-shimmer" style={{ width: '40%', height: '20px', marginBottom: '20px' }}></div>
          <div className="skeleton-text-group">
            <div className="skeleton-shimmer skeleton-line medium"></div>
            <div className="skeleton-shimmer skeleton-line medium"></div>
            <div className="skeleton-shimmer skeleton-line medium"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const GallerySkeleton = () => (
  <div className="skeleton-gallery-page animate-fade-in" style={{ padding: '2.5rem' }}>
    <div className="skeleton-shimmer" style={{ height: '100px', borderRadius: '24px', marginBottom: '2rem' }}></div>
    <div className="skeleton-gallery-grid">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="skeleton-gallery-card">
          <div className="skeleton-shimmer skeleton-media"></div>
          <div className="skeleton-caption">
            <div className="skeleton-shimmer skeleton-line medium"></div>
            <div className="skeleton-shimmer skeleton-line short"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
