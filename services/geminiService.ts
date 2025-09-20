import { GoogleGenAI } from "@google/genai";
import { commonWords } from '../wordlist';

// Fix: This file was empty. Implemented Gemini service to generate text.
// Per guidelines, initialize with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Helper function to generate fallback text if API fails or is unavailable
const generateFallbackText = (): string => {
  let text = '';
  const wordCount = 50; // Generate a fallback text of about 50 words
  for (let i = 0; i < wordCount; i++) {
    text += commonWords[Math.floor(Math.random() * commonWords.length)] + ' ';
  }
  return text.trim();
};

export const generateTypingTestText = async (topic: string, difficulty: string, wordCount: number, wordComplexity: string): Promise<string> => {
  let difficultyInstruction = '';
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      difficultyInstruction = 'The sentence structure should be "Beginner". Use short, straightforward sentence structures. Avoid complex punctuation like semicolons or colons.';
      break;
    case 'intermediate':
      difficultyInstruction = 'The sentence structure should be "Intermediate". Sentences should have varied length and structure, including some compound sentences.';
      break;
    case 'advanced':
      difficultyInstruction = 'The sentence structure should be "Advanced". Use complex sentence structures and varied punctuation. Include longer sentences with multiple clauses, commas, and possibly semicolons.';
      break;
    default:
      difficultyInstruction = `The sentence structure should be "Intermediate". Sentences should have varied length and structure.`;
  }
  
  let wordComplexityInstruction = '';
  switch (wordComplexity.toLowerCase()) {
    case 'simple':
      wordComplexityInstruction = 'For word complexity, use only simple, common vocabulary. The words should be easy to type and recognize.';
      break;
    case 'medium':
      wordComplexityInstruction = 'For word complexity, use a mix of common and slightly more complex words, reflecting standard vocabulary.';
      break;
    case 'complex':
      wordComplexityInstruction = 'For word complexity, use sophisticated and varied vocabulary. Include less common and more challenging words to type.';
      break;
    default:
      wordComplexityInstruction = 'For word complexity, use a mix of common and slightly more complex words.';
  }

  const prompt = `
    Generate a paragraph for a typing speed test.
    The paragraph must be about "${topic}".
    ${difficultyInstruction}
    ${wordComplexityInstruction}
    It should contain approximately ${wordCount} words.
    The text must be a single, continuous paragraph.
    Do not use any special characters, formatting like markdown, or quotation marks.
    Ensure the text flows naturally and is suitable for typing practice.
  `;

  try {
    // Per guideline: API key MUST be obtained exclusively from `process.env.API_KEY`.
    // We assume this is pre-configured. If not, we fall back gracefully.
    if (!process.env.API_KEY) {
      console.warn("API_KEY environment variable not found. Using fallback text.");
      return generateFallbackText();
    }

    // Fix: Use the correct model name 'gemini-2.5-flash' and API structure per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // Fix: Correctly access the generated text from the response per guidelines.
    const text = response.text;

    // Basic cleanup of the response text to ensure it's a single line and clean.
    const cleanedText = text.trim().replace(/\n/g, ' ').replace(/[\*"]/g, '');
    if (cleanedText.length < 50) { // Safety check for a decent paragraph length
        console.warn("Generated text is too short, using fallback.");
        return generateFallbackText();
    }
    return cleanedText;

  } catch (error) {
    console.error("Error generating typing test text with Gemini API:", error);
    // Fallback to locally generated text if API fails
    return generateFallbackText();
  }
};


export const generateTopicImage = async (topic: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("API_KEY environment variable not found. Skipping image generation.");
      return '';
    }

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Generate a high-quality, aesthetically pleasing, thematic image for the topic: "${topic}". The image should be suitable as a background. Cinematic, professional photography style.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return '';
  } catch (error) {
    console.error("Error generating image with Gemini API:", error);
    return ''; // Return an empty string on failure
  }
};
