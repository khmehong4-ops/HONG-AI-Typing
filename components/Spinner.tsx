import React from 'react';

const Spinner: React.FC = () => {
  const styles = `
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: var(--secondary-text-color);
      text-align: center;
      transition: color 0.3s;
    }
    .spinner {
      border: 4px solid var(--spinner-track-color);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border-left-color: var(--primary-color);
      animation: spin 1s ease infinite;
      transition: border-color 0.3s;
    }
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;

  return (
    <div className="spinner-container">
      <style>{styles}</style>
      <div className="spinner"></div>
      <p style={{ marginTop: '1rem' }}>Generating text & image with AI...</p>
    </div>
  );
};

export default Spinner;
