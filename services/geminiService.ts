
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { FullScript, VideoDuration, VoiceName, AspectRatio, VisualStyle, InputFile, InputMode } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- MODEL CONFIGURATION ---
const SCRIPT_MODEL = "gemini-3-pro-preview"; 
const IMAGE_MODEL = "imagen-4.0-generate-001"; 
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

const visualPromptSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        idea: { type: Type.STRING, description: "Clear visual concept." },
        prompt: { type: Type.STRING, description: "Detailed marker sketch description. Edge-to-edge drawing." },
        top_text: { type: Type.STRING, description: "Text integrated INTO the visual (1-3 words)." },
        labels: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "Contextual labels." 
        }
    },
    required: ["idea", "prompt", "top_text", "labels"]
};

const scriptSceneSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        voiceover: { type: Type.STRING, description: "Clean narration text." },
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
    let targetScenes = 6; 
    if (duration === '5s') targetScenes = 1;
    else if (duration === '15s') targetScenes = 3;
    else if (duration === '30s') targetScenes = 6;
    else if (duration === '1min') targetScenes = 13;

    const systemPrompt = `You are a professional video director for 'Explain'.
      
      STRICT NARRATIVE RULES:
      - TOTAL VIDEO DURATION: ${duration}.
      - SCENE COUNT: Exactly ${targetScenes} scenes.
      - LANGUAGE: Narrate in ${language}.
      
      STRICT VISUAL STYLE (CLEAN & CLEAR):
      - VISUALS: Minimalist professional marker sketch on a clean WHITE whiteboard.
      - CLEAR TEXTURES: No shading, no complex backgrounds. Beautiful thick ink lines.
      - INTEGRATED TEXT: Every scene must have text (1-3 words) hand-drawn AS PART OF the sketch.
      - DO NOT provide outer text instructions.
      
      Return ONLY valid JSON.`;

    const contents = [];
    if (file) {
        contents.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        contents.push({ text: `Context: ${file.name}` });
    }
    contents.push({ text: `Target Topic: ${topic}` });

    const response = await ai.models.generateContent({
      model: SCRIPT_MODEL,
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: fullScriptSchema,
        temperature: 0.7,
      },
    });

    if (!response.text) throw new Error("Narrative generation failed");
    return JSON.parse(response.text) as FullScript;
  }, 3, 2000, onStatusUpdate);
};

export const generateSceneImage = async (prompt: string, topText: string, labels: string[] | undefined, aspectRatio: AspectRatio, style: VisualStyle, useColor: boolean, onStatusUpdate?: (status: string) => void): Promise<string> => {
  return callWithRetry(async () => {
    const labelsPart = labels && labels.length > 0 ? `With clearly integrated labels: ${labels.join(", ")}` : "";
    
    let styleStr = useColor 
        ? "Professional high-definition marker illustration, clear crisp textures, vibrant primary marker colors, thick uniform black outlines. Pure white background. Minimalist sketch-note aesthetic. Perfect for whiteboard animation."
        : "Professional high-definition minimalist black marker ink strokes, clean uniform thick line art, no colors, high contrast. Pure white background. Minimalist sketch-note aesthetic.";
    
    const finalPrompt = `${styleStr}. Subject: ${prompt}. Integrated text "${topText.toUpperCase()}" hand-drawn in marker style within the composition. ${labelsPart}. Clear textures, edge-to-edge drawing.`;

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
    if (!base64) throw new Error("Visual asset data missing");
    return `data:image/jpeg;base64,${base64}`;
  }, 3, 1000, onStatusUpdate); 
};

export const generateSpeech = async (text: string, voiceName: VoiceName, audioCtx: AudioContext, onStatusUpdate?: (status: string) => void): Promise<AudioBuffer> => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Narration synthesis failed");

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
