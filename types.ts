// Fix: This file was empty, causing module resolution errors. 
// Added and exported types used across the application.
export interface TestStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
}

export type AppState = 'setup' | 'loading' | 'typing' | 'results';
