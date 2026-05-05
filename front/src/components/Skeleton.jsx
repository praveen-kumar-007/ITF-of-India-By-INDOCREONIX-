import React from 'react';
import './Skeleton.css';

export const GallerySkeleton = () => (
  <div className="skeleton-grid-gallery">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="skeleton-card-gallery">
        <div className="skeleton-media-gallery shimmer"></div>
        <div className="skeleton-content-gallery">
          <div className="skeleton-title shimmer"></div>
          <div className="skeleton-meta shimmer"></div>
        </div>
      </div>
    ))}
  </div>
);

export const NewsSkeleton = () => (
  <div className="skeleton-grid-news">
    {[1, 2, 3].map((i) => (
      <div key={i} className="skeleton-card-news">
        <div className="skeleton-image-news shimmer"></div>
        <div className="skeleton-body-news">
          <div className="skeleton-line shimmer"></div>
          <div className="skeleton-line shimmer short"></div>
          <div className="skeleton-text-block shimmer"></div>
          <div className="skeleton-btn shimmer"></div>
        </div>
      </div>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className="skeleton-form shimmer-container">
    <div className="skeleton-form-header shimmer"></div>
    <div className="skeleton-form-grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton-field shimmer"></div>
      ))}
    </div>
    <div className="skeleton-form-btn shimmer"></div>
  </div>
);
