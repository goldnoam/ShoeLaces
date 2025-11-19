import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StoryResponse, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const LANGUAGE_NAMES: Record<Language, string> = {
  he: 'Hebrew',
  en: 'English',
  zh: 'Chinese (Simplified)',
  es: 'Spanish',
  fr: 'French',
  ar: 'Arabic',
  hi: 'Hindi',
  ru: 'Russian'
};

export const generateShoeStory = async (childName: string, language: Language): Promise<StoryResponse> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A fun title for the story including the child's name" },
      intro: { type: Type.STRING, description: "An encouraging introduction" },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stepNumber: { type: Type.INTEGER },
            instruction: { type: Type.STRING, description: "Short technical instruction (e.g., make an X)" },
            storyPart: { type: Type.STRING, description: "The metaphor or story part (e.g., the bunny goes into the hole)" }
          },
          required: ["stepNumber", "instruction", "storyPart"]
        }
      },
      conclusion: { type: Type.STRING, description: "A congratulatory ending" }
    },
    required: ["title", "intro", "steps", "conclusion"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a fun, interactive guide for a 5-year-old named "${childName}" on how to tie shoelaces. 
      Language: ${LANGUAGE_NAMES[language] || 'English'}.
      Tone: Enthusiastic, simple, educational, and magical.
      Structure the guide into 5-6 clear steps using the "Bunny Ears" (or equivalent local name) method.
      Make sure the "storyPart" uses metaphors (bunny, tree, cave) that match the "instruction".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from API");
    
    return JSON.parse(text) as StoryResponse;
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};
