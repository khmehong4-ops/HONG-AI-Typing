import React, { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import TypingTest from './components/TypingTest';
import ResultsScreen from './components/ResultsScreen';
import Spinner from './components/Spinner';
import { generateTypingTestText, generateTopicImage } from './services/geminiService';
import type { TestStats, AppState } from './types';

const ThemeSwitcher = ({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) => {
  const styles = `
    .theme-switcher {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.2s ease-in-out;
      box-shadow: 0 4px 15px var(--shadow-color);
      z-index: 1000;
    }
    .theme-switcher:hover {
      transform: translateY(-2px);
    }
    .theme-switcher svg {
      width: 20px;
      height: 20px;
      stroke: var(--text-color);
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <button className="theme-switcher" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
        {theme === 'light' ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        )}
      </button>
    </>
  );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [testText, setTestText] = useState('');
  const [testDuration, setTestDuration] = useState(60);
  const [testStats, setTestStats] = useState<TestStats | null>(null);
  const [topicImage, setTopicImage] = useState<string>('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleStartTest = async (topic: string, duration: number, difficulty: string, wordComplexity: string) => {
    setAppState('loading');
    setTestDuration(duration);
    
    const wordCount = Math.round((duration / 60) * 50) + 10;
    
    try {
      const [text, imageUrl] = await Promise.all([
        generateTypingTestText(topic, difficulty, wordCount, wordComplexity),
        generateTopicImage(topic),
      ]);
      setTestText(text);
      setTopicImage(imageUrl);
      setAppState('typing');
    } catch (error) {
      console.error("Failed to start test:", error);
      // Fallback in case of error
      try {
        const text = await generateTypingTestText(topic, difficulty, wordCount, wordComplexity);
        setTestText(text);
        setTopicImage(''); // No image on fallback
        setAppState('typing');
      } catch (finalError) {
        console.error("Fallback text generation also failed:", finalError);
        setAppState('setup');
      }
    }
  };

  const handleTestComplete = (stats: TestStats) => {
    setTestStats(stats);
    setAppState('results');
  };

  const handleRestart = () => {
    setAppState('setup');
    setTestText('');
    setTestStats(null);
    setTopicImage('');
  };

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <Spinner />;
      case 'typing':
        return <TypingTest text={testText} duration={testDuration} onTestComplete={handleTestComplete} onRestart={handleRestart} topicImage={topicImage} />;
      case 'results':
        return testStats && <ResultsScreen stats={testStats} onRestart={handleRestart} topicImage={topicImage} />;
      case 'setup':
      default:
        return <SetupScreen onStartTest={handleStartTest} />;
    }
  };

  const styles = `
    .app-container {
      width: 100%;
      max-width: 800px;
      padding: 1rem;
      display: flex;
      justify-content: center;
      position: relative;
      z-index: 1;
    }
    .screen-content {
      width: 100%;
      display: flex;
      justify-content: center;
      animation: fadeIn 0.5s ease-in-out;
    }
    @keyframes fadeIn {
      from { 
        opacity: 0; 
        transform: translateY(15px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
  `;

  return (
    <div className="app-container">
      <style>{styles}</style>
      <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
      <div className="screen-content" key={appState}>
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
