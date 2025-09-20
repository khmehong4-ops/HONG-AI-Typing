import React, { useState } from 'react';
import KeyboardIcon from './icons/KeyboardIcon';
import TimerIcon from './icons/TimerIcon';
import TargetIcon from './icons/TargetIcon';
import BarChartIcon from './icons/BarChartIcon';
import BookIcon from './icons/BookIcon';

interface SetupScreenProps {
  onStartTest: (topic: string, duration: number, difficulty: string, wordComplexity: string) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartTest }) => {
  const [topic, setTopic] = useState('space exploration');
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [wordComplexity, setWordComplexity] = useState('Medium');

  const handleStart = () => {
    onStartTest(topic.trim() || 'random facts', duration, difficulty, wordComplexity);
  };

  const styles = `
    .setup-container {
      max-width: 500px;
      margin: 0 auto;
      padding: 2.5rem;
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 8px 30px var(--shadow-color);
      text-align: center;
      transition: background-color 0.3s, box-shadow 0.3s;
    }
    .setup-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 2rem;
    }
    .setup-header h1 {
      font-size: 2rem;
      color: var(--text-color);
      margin-top: 0.5rem;
      transition: color 0.3s;
    }
    .setup-header p {
      color: var(--secondary-text-color);
      margin-top: 0.5rem;
      transition: color 0.3s;
    }
    .config-group {
      margin-bottom: 1.5rem;
      text-align: left;
    }
    .config-label {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.75rem;
      transition: color 0.3s;
    }
    .config-label svg {
      margin-right: 0.5rem;
      color: var(--icon-color);
    }
    .topic-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
      background-color: var(--background-color);
      color: var(--text-color);
      transition: background-color 0.3s, color 0.3s, border-color 0.3s;
    }
    .options-group {
      display: flex;
      justify-content: space-between;
    }
    .options-group label {
      flex: 1;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      margin: 0 0.25rem;
    }
    .options-group label:hover span {
      background-color: var(--current-bg);
    }
    .options-group input {
      display: none;
    }
    .options-group span {
       transition: all 0.2s ease-in-out;
    }
    .options-group input:checked + span {
      background-color: var(--primary-color);
      color: var(--button-text-color);
      border-color: var(--primary-color);
      transform: scale(1.02);
    }
    .start-button {
      width: 100%;
      padding: 1rem;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      background-color: var(--button-bg);
      color: var(--button-text-color);
      box-shadow: 0 4px 15px var(--shadow-color);
    }
    .start-button:hover {
      background-color: var(--button-hover-bg);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px var(--shadow-color);
    }
    .start-button:active {
      transform: translateY(0) scale(0.98);
      box-shadow: 0 2px 10px var(--shadow-color);
    }
  `;

  return (
    <div className="setup-container">
      <style>{styles}</style>
      <div className="setup-header">
        <KeyboardIcon width="48" height="48" color="var(--icon-color)"/>
        <h1>HONG AI Typing</h1>
        <p>Set up your test and see how fast you can type!</p>
      </div>
      
      <div className="config-group">
        <label className="config-label" htmlFor="topic-input"><TargetIcon /> <span>Topic</span></label>
        <input
          id="topic-input"
          type="text"
          className="topic-input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., space exploration"
        />
      </div>

      <div className="config-group">
        <label className="config-label"><BarChartIcon /> <span>Sentence Structure</span></label>
        <div className="options-group">
          {['Beginner', 'Intermediate', 'Advanced'].map((d) => (
            <label key={d}>
              <input
                type="radio"
                name="difficulty"
                value={d}
                checked={difficulty === d}
                onChange={() => setDifficulty(d)}
              />
              <span style={{display: 'block', borderRadius: '5px', padding: '0.75rem', textAlign: 'center'}}>{d}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="config-group">
        <label className="config-label"><BookIcon /> <span>Word Complexity</span></label>
        <div className="options-group">
          {['Simple', 'Medium', 'Complex'].map((c) => (
            <label key={c}>
              <input
                type="radio"
                name="wordComplexity"
                value={c}
                checked={wordComplexity === c}
                onChange={() => setWordComplexity(c)}
              />
              <span style={{display: 'block', borderRadius: '5px', padding: '0.75rem', textAlign: 'center'}}>{c}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="config-group">
        <label className="config-label"><TimerIcon /> <span>Duration (seconds)</span></label>
        <div className="options-group">
          {[15, 30, 60, 120].map((d) => (
            <label key={d}>
              <input
                type="radio"
                name="duration"
                value={d}
                checked={duration === d}
                onChange={() => setDuration(d)}
              />
              <span style={{display: 'block', borderRadius: '5px', padding: '0.75rem', textAlign: 'center'}}>{d}</span>
            </label>
          ))}
        </div>
      </div>
      
      <button className="start-button" onClick={handleStart}>
        Start Test
      </button>
    </div>
  );
};

export default SetupScreen;