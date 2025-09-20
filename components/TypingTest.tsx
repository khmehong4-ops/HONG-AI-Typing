import React, { useState, useEffect, useRef } from 'react';
import { TestStats } from '../types';
import { playKeystrokeSound, playErrorSound } from '../audio';
import { commonWords } from '../wordlist';
import SoundOnIcon from './icons/SoundOnIcon';
import SoundOffIcon from './icons/SoundOffIcon';

interface TypingTestProps {
  text: string;
  duration: number;
  onTestComplete: (stats: TestStats) => void;
  onRestart: () => void;
  topicImage: string;
}

const WORDS_PER_LINE = 12;

// Main Typing Test Component
const TypingTest: React.FC<TypingTestProps> = ({ text, duration, onTestComplete, onRestart, topicImage }) => {
  // Use a ref to hold the full queue of words from the initial AI-generated text.
  // This avoids re-renders when the queue is modified.
  const wordQueue = useRef<string[]>(text.split(' '));

  // Helper function to get the next line of words.
  // It first tries to use the AI text, then falls back to random words.
  const getNextLine = (): string[] => {
    let nextWords: string[] = [];
    
    // Pull from the initial AI-generated text queue if available
    if (wordQueue.current.length > 0) {
      const wordsToTake = Math.min(WORDS_PER_LINE, wordQueue.current.length);
      nextWords = wordQueue.current.splice(0, wordsToTake);
    }
    
    // If the queue is exhausted or wasn't enough for a full line, add random words.
    if (nextWords.length < WORDS_PER_LINE) {
      const remainingNeeded = WORDS_PER_LINE - nextWords.length;
      const randomWords = Array.from({ length: remainingNeeded }, () => 
        commonWords[Math.floor(Math.random() * commonWords.length)]
      );
      nextWords.push(...randomWords);
    }
    return nextWords;
  };

  // State Management
  const [words, setWords] = useState<string[]>(() => getNextLine()); // This holds the current line being typed.
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [typedWordsHistory, setTypedWordsHistory] = useState<string[]>([]);
  
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [testStarted, setTestStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Stats State
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);

  // Refs for managing focus and timer
  const testEndedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input field on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Timer countdown logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && testStarted) {
      endTest();
    }
    return () => clearInterval(timer);
  }, [testStarted, timeRemaining]);
  
  // Handles ending the test and calculating final stats
  const endTest = () => {
    if (testEndedRef.current) return;
    testEndedRef.current = true;
    setTestStarted(false);
    
    const totalCharsTyped = correctChars + incorrectChars;
    const wpm = Math.round((correctChars / 5) / (duration / 60));
    const accuracy = totalCharsTyped > 0 ? Math.round((correctChars / totalCharsTyped) * 100) : 100;

    onTestComplete({
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars: totalCharsTyped,
    });
  };

  // Handles keyboard input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (testEndedRef.current) return;

    const value = e.target.value;
    if (value.endsWith(' ')) return; // Spaces are handled by keydown to prevent double-processing

    if (!testStarted && value.length > 0) {
      setTestStarted(true);
    }
    
    setCurrentInput(value);

    // Play sound based on character accuracy
    if (soundEnabled) {
      const targetWord = words[currentWordIndex];
      const lastChar = value.slice(-1);
      const targetChar = targetWord[value.length - 1];
      if (lastChar === targetChar) {
        playKeystrokeSound();
      } else {
        playErrorSound();
      }
    }
  };

  // Processes the typed word and moves to the next, or clears the line.
  const moveToNextWord = () => {
    const targetWord = words[currentWordIndex];

    // --- Recalculate stats for the completed word ---
    let correctInWord = 0;
    // Only compare up to the length of the shorter string initially
    const commonLength = Math.min(targetWord.length, currentInput.length);
    for (let i = 0; i < commonLength; i++) {
        if (currentInput[i] === targetWord[i]) {
            correctInWord++;
        }
    }
    const incorrectTyped = currentInput.length - correctInWord;
    const missedChars = Math.max(0, targetWord.length - currentInput.length);
    
    setCorrectChars(prev => prev + correctInWord);
    setIncorrectChars(prev => prev + incorrectTyped + missedChars);
    
    // The spacebar press also counts as a character.
    if (targetWord === currentInput) {
        setCorrectChars(prev => prev + 1);
    } else {
        setIncorrectChars(prev => prev + 1);
    }

    // --- Decide whether to move to next word or next line ---
    if (currentWordIndex === words.length - 1) {
      // Last word of the line, so generate a new line.
      setWords(getNextLine());
      setCurrentWordIndex(0);
      setTypedWordsHistory([]);
    } else {
      // Not the last word, just move to the next index.
      setTypedWordsHistory(prev => [...prev, currentInput]);
      setCurrentWordIndex(prev => prev + 1);
    }

    setCurrentInput('');
  };

  // Handles special key presses like spacebar
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' && currentInput.length > 0) {
      e.preventDefault();
      if (testEndedRef.current) return;
      moveToNextWord();
    }
  };
  
  // Real-time stat calculation for display
  const elapsedSeconds = duration - timeRemaining;
  const totalStrokes = correctChars + incorrectChars;
  const wpm = (testStarted && elapsedSeconds > 0) 
    ? Math.round((correctChars / 5) / (elapsedSeconds / 60)) 
    : 0;
  const currentAccuracy = totalStrokes > 0 ? Math.round((correctChars / totalStrokes) * 100) : 100;

  // Renders a single word with character-by-character validation for the current word
  const renderWord = (word: string, index: number) => {
    const isCompleted = index < currentWordIndex;
    const isCurrent = index === currentWordIndex;
    const isUntyped = index > currentWordIndex;
    
    let wordClassName = 'word';
    if (isCompleted) {
        wordClassName += typedWordsHistory[index] === word ? ' correct' : ' incorrect';
    }
    if (isCurrent) wordClassName += ' current';
    if (isUntyped) wordClassName += ' untyped';

    return (
      <span className={wordClassName} key={index}>
        {word.split('').map((char, charIndex) => {
          let charClassName = '';
          if (isCurrent) {
            // Style characters that have been typed
            if (charIndex < currentInput.length) {
              charClassName = currentInput[charIndex] === char ? 'char-correct' : 'char-incorrect';
            } 
            // Add blinking cursor before the next character to be typed
            else if (charIndex === currentInput.length) {
              charClassName = 'cursor';
            }
            // Style characters that have not yet been typed
            else {
              charClassName = 'char-untyped';
            }
          }
          return <span key={charIndex} className={charClassName}>{char}</span>;
        })}
        {/* Render extra characters typed by the user in red */}
        {isCurrent && currentInput.length > word.length &&
          currentInput.substring(word.length).split('').map((char, i) => (
            <span key={i} className="char-incorrect extra">{char}</span>
          ))
        }
      </span>
    );
  };

  const styles = `
    .typing-test-container {
      width: 100%;
      max-width: 800px;
      padding: 2rem;
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 8px 30px var(--shadow-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: background-color 0.3s, box-shadow 0.3s;
    }
    .topic-image-header {
      width: calc(100% + 4rem);
      height: 100px;
      margin-top: -2rem;
      margin-bottom: 1.5rem;
      object-fit: cover;
      border-radius: 12px 12px 0 0;
      opacity: 0.8;
    }
    .stats-bar {
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .stat-item {
      text-align: center;
      min-width: 80px;
    }
    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-color);
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }
    .text-display {
      font-family: 'Courier New', Courier, monospace;
      font-size: 1.5rem;
      line-height: 2.2rem;
      text-align: justify;
      min-height: 5.5rem; /* Reserve space for two lines in case of wrapping */
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-content: center;
      margin-bottom: 1.5rem;
      transition: opacity 0.2s ease-in-out;
    }
    
    .word {
      margin-right: 0.75ch; /* Space between words */
      display: inline-block;
      white-space: nowrap;
      padding: 2px 0;
      border-radius: 4px;
      transition: background-color 0.2s, color 0.2s;
    }
    .word.untyped { 
      color: var(--untyped-color); 
    }
    .word.correct { 
      color: var(--correct-color); 
    }
    .word.incorrect { 
      color: var(--incorrect-color);
      text-decoration: underline;
      text-decoration-color: var(--incorrect-color);
    }
    .word.current {
      background-color: var(--current-bg);
      color: var(--text-color);
    }
    
    /* Per-character styling for the current word */
    .word.current .char-correct { 
      color: var(--correct-color); 
    }
    .word.current .char-incorrect {
      color: var(--incorrect-color);
      background-color: var(--incorrect-bg);
      border-radius: 2px;
    }
    .word.current .char-untyped {
      color: var(--untyped-color);
    }
    .word.current .char-incorrect.extra {
      text-decoration: underline;
      text-decoration-color: var(--incorrect-color);
    }
    .word.current span { 
      position: relative; 
    }
    
    /* Cursor styling */
    .word.current .cursor::before {
      content: '';
      position: absolute;
      left: -1px;
      top: 2px;
      bottom: 2px;
      width: 2px;
      background-color: var(--primary-color);
      animation: blink 1s infinite;
      border-radius: 1px;
    }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

    .input-area {
      display: flex;
      gap: 1rem;
      width: 100%;
      align-items: center;
    }
    .typing-input {
      flex-grow: 1;
      font-family: 'Courier New', Courier, monospace;
      font-size: 1.5rem;
      padding: 0.75rem;
      border-radius: 6px;
      border: 2px solid var(--border-color);
      background-color: var(--background-color);
      color: var(--text-color);
      transition: border-color 0.2s;
    }
    .typing-input:focus { outline: none; border-color: var(--primary-color); }
    
    .control-button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      background-color: transparent;
      color: var(--text-color);
      transition: all 0.2s ease-in-out;
    }
    .control-button:hover { background-color: var(--current-bg); border-color: var(--primary-color); }
    
    .sound-button {
      background: none; border: none; cursor: pointer; color: var(--icon-color);
      padding: 0.5rem; display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
    }
    .sound-button:hover { background-color: var(--current-bg); }
  `;

  return (
    <div className="typing-test-container" onClick={() => inputRef.current?.focus()}>
      <style>{styles}</style>
      {topicImage && <img src={topicImage} alt="Topic" className="topic-image-header" />}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{timeRemaining}</div>
          <div className="stat-label">Seconds</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{wpm}</div>
          <div className="stat-label">WPM</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{currentAccuracy}</div>
          <div className="stat-label">% Accuracy</div>
        </div>
      </div>

      <div className="text-display">
        {words.map((word, index) => renderWord(word, index))}
      </div>

      <div className="input-area">
        <input
          ref={inputRef}
          type="text"
          className="typing-input"
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={timeRemaining === 0}
        />
        <button className="control-button" onClick={onRestart}>Restart</button>
        <button className="sound-button" title="Toggle Sound" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>
      </div>
    </div>
  );
};

export default TypingTest;