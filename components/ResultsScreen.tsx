import React, { useState, useEffect } from 'react';
import { TestStats } from '../types';

interface ResultsScreenProps {
  stats: TestStats;
  onRestart: () => void;
  topicImage: string;
}

const AnimatedNumber = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animationFrame = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Ease out quadratic
      const easedPercentage = percentage * (2 - percentage);
      
      setDisplayValue(Math.floor(value * easedPercentage));

      if (progress < duration) {
        requestAnimationFrame(animationFrame);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animationFrame);

  }, [value, duration]);

  return <>{displayValue}</>;
};

const ResultsScreen: React.FC<ResultsScreenProps> = ({ stats, onRestart, topicImage }) => {
  const styles = `
    .results-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2.5rem;
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 8px 30px var(--shadow-color);
      transition: background-color 0.3s, box-shadow 0.3s;
      width: 100%;
      max-width: 500px;
    }
    .topic-image {
      width: calc(100% + 5rem); /* Extend beyond padding */
      margin-top: -2.5rem;
      margin-bottom: 1.5rem;
      height: 180px;
      object-fit: cover;
      border-radius: 12px 12px 0 0;
      opacity: 0;
      animation: slideDownFadeIn 0.6s ease-out forwards;
    }
    @keyframes slideDownFadeIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .results-container h2 {
      font-size: 2rem;
      margin-bottom: 1.5rem;
      color: var(--text-color);
      transition: color 0.3s;
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
      width: 100%;
      max-width: 400px;
    }
    @keyframes slideUpFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .result-item {
      background-color: var(--background-color);
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 15px var(--shadow-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: background-color 0.3s, box-shadow 0.3s;
      opacity: 0;
      animation: slideUpFadeIn 0.5s ease-out forwards;
    }
    .results-grid .result-item:nth-child(1) { animation-delay: 0.2s; }
    .results-grid .result-item:nth-child(2) { animation-delay: 0.3s; }
    .results-grid .result-item:nth-child(3) { animation-delay: 0.4s; }
    .results-grid .result-item:nth-child(4) { animation-delay: 0.5s; }
    .result-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-color);
      transition: color 0.3s;
    }
    .result-value.wpm {
      color: var(--correct-color);
    }
    .result-label {
      font-size: 0.9rem;
      color: var(--secondary-text-color);
      margin-top: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: color 0.3s;
    }
    .restart-button {
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      background-color: var(--primary-color);
      color: var(--button-text-color);
      box-shadow: 0 4px 15px var(--shadow-color);
    }
    .restart-button:hover {
      background-color: var(--button-hover-bg);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px var(--shadow-color);
    }
    .restart-button:active {
      transform: translateY(0) scale(0.98);
      box-shadow: 0 2px 10px var(--shadow-color);
    }
  `;
  return (
    <div className="results-container">
      <style>{styles}</style>
      {topicImage && <img src={topicImage} alt="Generated topic visual" className="topic-image" />}
      <h2>Test Complete!</h2>
      <div className="results-grid">
        <div className="result-item">
          <span className="result-value wpm"><AnimatedNumber value={stats.wpm} /></span>
          <span className="result-label">Words/Min</span>
        </div>
        <div className="result-item">
          <span className="result-value"><AnimatedNumber value={stats.accuracy} />%</span>
          <span className="result-label">Accuracy</span>
        </div>
        <div className="result-item">
          <span className="result-value"><AnimatedNumber value={stats.correctChars} /></span>
          <span className="result-label">Correct Chars</span>
        </div>
        <div className="result-item">
          <span className="result-value"><AnimatedNumber value={stats.incorrectChars} /></span>
          <span className="result-label">Incorrect Chars</span>
        </div>
      </div>
      <button className="restart-button" onClick={onRestart}>
        Try Again
      </button>
    </div>
  );
};

export default ResultsScreen;
