
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AIInsight, JournalEntry } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyInsight = async (user: UserProfile, recentEntries: JournalEntry[]): Promise<AIInsight> => {
  const ai = getAI();
  const context = recentEntries.map(e => `[${e.date}] ${e.title}: ${e.content}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these recent journal entries for ${user.name} and provide a single brief, profound insight or encouraging observation (max 20 words). 
      Entries: ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['encouragement', 'observation', 'challenge'] }
          },
          required: ["text", "type"]
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as AIInsight;
  } catch (error) {
    console.error("AI Insight Error", error);
    return { text: "Consistency is key. Keep writing your story.", type: "encouragement" };
  }
};

export const enhanceText = async (text: string, mode: 'grammar' | 'expand' | 'tone_positive'): Promise<string> => {
  const ai = getAI();
  
  let systemInstruction = "";
  
  switch (mode) {
    case 'grammar':
      systemInstruction = "You are a professional copy editor. Your task is to fix grammar and spelling errors in the input text. Maintain the original tone and style. Output STRICTLY the corrected text only. Do not provide explanations, conversational filler, lists of options, or markdown formatting.";
      break;
    case 'expand':
      systemInstruction = "You are a creative writing assistant. Expand the input text with more descriptive detail while strictly maintaining the original perspective and voice. Output STRICTLY the expanded text only.";
      break;
    case 'tone_positive':
      systemInstruction = "You are an empathetic writing coach. Rewrite the input text to sound more optimistic, hopeful, and grateful. Output STRICTLY the rewritten text only.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    // Clean up potential markdown artifacts if the model disobeys slightly
    let result = response.text || text;
    result = result.replace(/^```(markdown|text)?\n/i, '').replace(/\n```$/, '');
    return result.trim();
  } catch (error) {
    console.error("Enhance Text Error", error);
    return text;
  }
};

export const summarizeEntry = async (text: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: {
        systemInstruction: "You are a concise summarizer. Create a 1 sentence summary (max 15 words) of the following journal entry. Capture the core emotion or event. Output STRICTLY the summary text only."
      }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Summary Error", error);
    return "";
  }
}

export const generateTags = async (text: string): Promise<string[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of 5-7 relevant, concise tags (single words or short phrases, lowercase) for the following journal entry.
      Output STRICTLY a JSON array of strings.
      Entry: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Generate Tags Error", error);
    return [];
  }
};
