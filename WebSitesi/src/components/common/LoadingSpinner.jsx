import React from 'react';

function LoadingSpinner() {
  return (
    <div className="loading-spinner" role="status" aria-label="Yükleniyor">
      <svg className="spinner-svg" viewBox="0 0 50 50">
        <circle className="spinner-bg" cx="25" cy="25" r="20" fill="none" stroke="#232526" strokeWidth="6" opacity="0.18" />
        <circle className="spinner-fg" cx="25" cy="25" r="20" fill="none" stroke="#43e97b" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <span className="loading-text">Yükleniyor...</span>
    </div>
  );
}

export default LoadingSpinner;
