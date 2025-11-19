
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

/**
 * Fetches real-time stock data using Google Search Grounding.
 */
export const fetchStockDetails = async (symbol: string): Promise<{ price: number; changePercent: number; currency: string } | null> => {
  try {
    // Remove $ for search query
    const cleanSymbol = symbol.replace('$', '');
    const modelId = 'gemini-2.5-flash';
    
    // Note: responseSchema and responseMimeType are NOT supported with googleSearch tool.
    // We must rely on prompt engineering to get JSON.
    const prompt = `Find the current real-time stock price and percentage change for ${cleanSymbol} (NSE/BSE preferred if Indian, otherwise US). 
    Output ONLY a raw JSON object with these exact keys: "price" (number), "changePercent" (number), "currency" (string).
    Example output: { "price": 1450.20, "changePercent": 1.5, "currency": "INR" }
    Do not include markdown formatting or explanations.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    // Extract JSON from potential markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        // Basic validation
        if (typeof data.price === 'number') {
            return data;
        }
    }
    return null;
  } catch (error) {
    console.error("Stock fetch failed", error);
    return null;
  }
};

export interface NewsItem {
  title: string;
  source: string;
  timeAgo: string;
  url: string;
}

/**
 * Fetches recent news for a stock using Google Search.
 */
export const fetchStockNews = async (symbol: string): Promise<NewsItem[]> => {
  try {
    const cleanSymbol = symbol.replace('$', '');
    const modelId = 'gemini-2.5-flash';
    
    const prompt = `Find the top 2 latest financial news headlines for ${cleanSymbol}.
    Return a strict JSON array (no markdown) where each object has:
    "title" (string),
    "source" (string, e.g. Bloomberg),
    "timeAgo" (string, e.g. "1h ago"),
    "url" (string).`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("News fetch failed", error);
    return [];
  }
};
