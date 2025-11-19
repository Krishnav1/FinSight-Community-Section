import { GoogleGenAI, Type } from "@google/genai";

// Initialize the client
// process.env.API_KEY is guaranteed to be available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a market-related post for sentiment and key risks.
 */
export const analyzePostSentiment = async (postContent: string): Promise<{ sentiment: string; risk: string; summary: string }> => {
  try {
    const modelId = 'gemini-2.5-flash';
    const prompt = `Analyze the following stock market post from an investor community. 
    Determine the sentiment (Bullish, Bearish, or Neutral), identify any potential risks mentioned or implied, and provide a very short 1-sentence summary.
    
    Post: "${postContent}"`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
            risk: { type: Type.STRING, description: "Potential risks identified" },
            summary: { type: Type.STRING, description: "A one sentence summary" }
          },
          required: ["sentiment", "risk", "summary"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("AI Analysis Failed", error);
    return {
      sentiment: "Neutral",
      risk: "Could not analyze risks at this time.",
      summary: "Analysis unavailable."
    };
  }
};

/**
 * Summarizes a live chat session to catch up a user.
 */
export const summarizeChat = async (messages: string[]): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    const chatLog = messages.join("\n");
    const prompt = `Summarize the key market trends and discussion points from this chat log in 3 bullet points. Keep it concise for a trader.
    
    Chat Log:
    ${chatLog}`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "No summary available.";
  } catch (error) {
    return "Unable to generate summary.";
  }
};
