
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { FullScript, VideoDuration, VoiceName, AspectRatio, VisualStyle, InputFile, InputMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SCRIPT_MODEL = "gemini-3-flash-preview"; 
const IMAGE_MODEL = "imagen-4.0-generate-001"; 
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

const visualPromptSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        idea: { type: Type.STRING, description: "Very brief concept (e.g., 'Growth metaphor')." },
        gen_prompt: { type: Type.STRING, description: "Telegraphic Prompt. Max 15 words. Comma-separated keywords: [Subject], [Action], [Objects], [Style]. Style keywords must include: 'Doodle', 'thick marker', 'stick figure'." },
        top_text: { type: Type.STRING, description: "Key phrase to write on board (max 3 words)." },
        labels: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "1-2 keywords for labels inside the drawing."
        }
    },
    required: ["idea", "gen_prompt", "top_text", "labels"]
};

const scriptSceneSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        voiceover: { type: Type.STRING, description: "The exact text for this segment." },
        visualPrompt: visualPromptSchema
    },
    required: ["voiceover", "visualPrompt"]
};

const fullScriptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scenes: { 
        type: Type.ARRAY, 
        items: scriptSceneSchema,
        description: "Sequence of scenes."
    }
  },
  required: ["scenes"]
};

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000, onRetry?: (msg: string) => void): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        const isRateLimit = error.message?.includes('429') || error.message?.includes('quota');
        if (isRateLimit && retries > 0) {
            const backoff = Math.min(delay * 2, 10000); 
            if (onRetry) onRetry(`Busy... Retrying in ${Math.round(backoff/1000)}s`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            return callWithRetry(fn, retries - 1, backoff, onRetry);
        }
        throw error;
    }
}

export const generateScript = async (topic: string, duration: VideoDuration, aspectRatio: AspectRatio, language: string, inputMode: InputMode, file?: InputFile, onStatusUpdate?: (status: string) => void): Promise<FullScript> => {
  return callWithRetry(async () => {
    let targetSeconds = 30;
    if (duration === '5s') targetSeconds = 5;
    else if (duration === '15s') targetSeconds = 15;
    else if (duration === '30s') targetSeconds = 30;
    else if (duration === '1min') targetSeconds = 60;
    else if (duration === '2min') targetSeconds = 120;
    
    // Role: Visual Engine for Golpo
    const systemPrompt = `You are the Visual Engine for a cost-optimized Whiteboard Animation App. 
    
    STRICT VISUAL STYLE (The "Golpo" Look):
    All image prompts must describe:
    * Style: Hand-drawn doodle, thick marker lines, sketch-note style.
    * Elements: Stick figures, simple icons (lightbulbs, gears), flowcharts, and arrows.
    * Colors: Primary marker colors (Blue, Orange, Green, Red) with black outlines.
    * NO: Photorealism, 3D, shading, complex backgrounds, or cinematic lighting.

    PROTOCOL (Token Compression):
    1. Max Length: Keep 'gen_prompt' under 15 words.
    2. No Filler: Remove "A picture of", "Show me".
    3. Format: [Subject], [Action], [Objects], [Style]

    Output JSON Only. Language: ${language}.
    Target Duration: ${duration}.`;

    const contents = [{ text: `Convert this topic/script into a scene sequence: ${topic}. \n\nIf provided, use this context file content: ${file ? atob(file.data).substring(0, 10000) : "None"}` }];

    const response = await ai.models.generateContent({
      model: SCRIPT_MODEL,
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: fullScriptSchema,
        temperature: 0.7, // Lower temperature for more consistent formatting
      },
    });

    if (!response.text) throw new Error("Script generation failed");
    return JSON.parse(response.text) as FullScript;
  }, 3, 2000, onStatusUpdate);
};

export const generateSceneImage = async (prompt: string, topText: string, labels: string[], aspectRatio: AspectRatio, style: VisualStyle, onStatusUpdate?: (status: string) => void): Promise<string> => {
  return callWithRetry(async () => {
    // We take the telegraphic prompt from the script and enforce the "Golpo" look here
    const styleEnforcement = "style of hand-drawn doodle, thick marker lines, sketch-note, stick figures, white paper background, simple icon, high contrast, primary colors (Blue, Red, Green, Orange), black outlines. NO shading, NO 3D, NO photorealism.";
    
    // Combining the telegraphic prompt with the style enforcement
    const finalPrompt = `${prompt}, ${styleEnforcement}`;

    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        outputMimeType: 'image/jpeg',
      }
    });

    const base64 = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64) throw new Error("Image generation failed");
    return `data:image/jpeg;base64,${base64}`;
  }, 3, 1000, onStatusUpdate); 
};

export const generateSpeech = async (text: string, voiceName: VoiceName, audioCtx: AudioContext, onStatusUpdate?: (status: string) => void): Promise<AudioBuffer> => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: { parts: [{ text: text }] }, // Direct text, removed "Speak as..." to keep it natural/fast
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio synthesis failed");

    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    
    return buffer;
  }, 3, 1000, onStatusUpdate);
};
