
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { FullScript, VideoDuration, VoiceName, AspectRatio, VisualStyle, InputFile, InputMode } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- MODEL CONFIGURATION & PRICING (Per Unit) ---

// SCRIPT: Gemini 3 Pro
const SCRIPT_MODEL = "gemini-3-pro-preview"; 
const COST_SCRIPT_PER_RUN = 0.004; // Avg input/output tokens for a script

// IMAGE: Imagen 4.0 Fast
const IMAGE_MODEL = "imagen-4.0-generate-001"; 
const COST_IMAGE_PER_UNIT = 0.01; // Target per-image cost

// AUDIO: Gemini Flash TTS
// NOTE: 'gemini-2.5-flash-preview-tts' is the dedicated TTS model. 
// Pro models generally do not support direct TTS output in standard endpoints.
const TTS_MODEL = "gemini-2.5-flash-preview-tts";
const COST_AUDIO_PER_MIN = 0.015; // Approx cost per minute of audio

const visualPromptSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        idea: { type: Type.STRING, description: "Visual Metaphor (e.g. 'Man drowning in paperwork')." },
        prompt: { type: Type.STRING, description: "Detailed scene description. Expressive characters. Action." },
        top_text: { type: Type.STRING, description: "Punchy Hand-Lettered Title (2-4 words)." },
        labels: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "1-2 labels for clarity." 
        }
    },
    required: ["idea", "prompt", "top_text", "labels"]
};

const scriptSceneSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        voiceover: { type: Type.STRING, description: "Voiceover text." },
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

// --- HIGH TRAFFIC HANDLER ---
async function callWithRetry<T>(
    fn: () => Promise<T>, 
    retries = 3,  
    delay = 1000, 
    onRetry?: (msg: string) => void
): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        const isRateLimit = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('resource exhausted');
        const isServerOverload = error.message?.includes('503') || error.message?.includes('500');

        if ((isRateLimit || isServerOverload) && retries > 0) {
            const backoff = Math.min(delay * 2, 10000); 
            const msg = `High Traffic (${error.status || 'Busy'}). Pausing for ${Math.round(backoff/1000)}s...`;
            
            console.warn(msg);
            if (onRetry) onRetry(msg);

            await new Promise(resolve => setTimeout(resolve, backoff));
            return callWithRetry(fn, retries - 1, backoff, onRetry);
        } else if (retries === 0 && isRateLimit) {
            // Explicit error for UI
            throw new Error("Quota Exceeded. Please check your Google AI Studio limits or Billing Account.");
        } else if (retries > 0) {
            console.warn(`API Error: ${error.message}. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callWithRetry(fn, retries - 1, delay * 1.5, onRetry);
        } else {
            throw error;
        }
    }
}

export const generateScript = async (
    topic: string, 
    duration: VideoDuration, 
    aspectRatio: AspectRatio, 
    language: string, 
    inputMode: InputMode, 
    file?: InputFile, 
    onStatusUpdate?: (status: string) => void
): Promise<FullScript> => {
  return callWithRetry(async () => {
    
    // COST OPTIMIZATION: STRICT SCENE COUNT
    // Minimizes Output Tokens by enforcing a rigid structure.
    
    let targetWordCount = 40; 
    let minScenes = 4;
    let maxScenes = 4;
    let durationMin = 0.5;

    if (duration === '5s') {
        targetWordCount = 12; minScenes = 1; maxScenes = 2; durationMin = 0.1;
    }
    else if (duration === '15s') { 
        targetWordCount = 30; minScenes = 4; maxScenes = 4; durationMin = 0.25;
    }
    else if (duration === '30s') { 
        targetWordCount = 65; minScenes = 7; maxScenes = 8; durationMin = 0.5;
    } 
    else if (duration === '1min') { 
        targetWordCount = 130; minScenes = 15; maxScenes = 15; durationMin = 1.0;
    }
    else if (duration === '2min') {
        targetWordCount = 260; minScenes = 30; maxScenes = 30; durationMin = 2.0;
    }
    else if (duration === '5min') { 
        targetWordCount = 650; minScenes = 75; maxScenes = 75; durationMin = 5.0;
    } 
    else { 
        targetWordCount = 3500; minScenes = 250; maxScenes = 300; durationMin = 25.0;
    }

    const pacingInstruction = `Pacing: STRICT 4 seconds per scene. Total scenes: ${minScenes}.`;

    let coreInstruction = "";
    if (inputMode === 'script') {
        coreInstruction = `
            **MODE: EXACT SCRIPT ADAPTATION**
            1. Use provided text verbatim (translate to ${language}).
            2. SPLIT into EXACTLY ${minScenes} scenes.
            3. Create a cohesive visual narrative where each scene flows into the next.
        `;
    } else {
        coreInstruction = `
            **MODE: CREATIVE GENERATION**
            1. Write a script about: ${topic}.
            2. Target Word Count: ${targetWordCount}.
            3. EXACT SCENE COUNT: ${minScenes}.
            4. Ensure a strong narrative arc (Hook -> Concept -> Explanation -> Conclusion).
        `;
    }

    const systemPrompt = `
      You are "Explain", a professional whiteboard video director.
      
      ${coreInstruction}
      ${pacingInstruction}
      Language: ${language}.
      
      **VISUAL STYLE GUIDANCE:**
      - **Style:** "Sketch-note" infographic aesthetic. Hand-drawn diagrams and doodles.
      - **Visuals:** Central concept with connected nodes, arrows, and small icons.
      - **Metaphors:** Use visual metaphors to explain abstract concepts (e.g., a funnel for "Sales").
      - **Continuity:** Try to make visual elements flow from one scene to another if possible.
      - **Text:** Keep top_text extremely short (1-3 words) and impactful.
      
      Output JSON only.
    `;

    const contents = [];
    if (file) {
        contents.push({
            inlineData: { mimeType: file.mimeType, data: file.data }
        });
        contents.push({ text: `Source Document: ${file.name}` });
    }
    const inputLabel = inputMode === 'script' ? "Full Script Text" : "Topic/Request";
    contents.push({ text: `${inputLabel}: ${topic}` });

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

    if (!response.text) throw new Error("No text returned from Gemini");
    const script = JSON.parse(response.text) as FullScript;

    // --- REAL DATA COST CALCULATION ---
    const sceneCount = script.scenes.length;
    const estAudioCost = durationMin * COST_AUDIO_PER_MIN;
    const estImageCost = sceneCount * COST_IMAGE_PER_UNIT;
    const totalEst = COST_SCRIPT_PER_RUN + estAudioCost + estImageCost;
    
    script.estimatedCost = Number(totalEst.toFixed(4));

    return script;
  }, 10, 2000, onStatusUpdate);
};

export const generateSceneImage = async (prompt: string, topText: string, labels: string[] | undefined, aspectRatio: AspectRatio, style: VisualStyle, onStatusUpdate?: (status: string) => void): Promise<string> => {
  return callWithRetry(async () => {
    
    const labelString = labels && labels.length > 0 ? `Labels: "${labels.join(", ")}"` : "";

    // Optimized Prompting for Imagen 4
    // We use descriptive keywords rather than conversational instructions for better diffusion results.
    let finalPrompt = "";
    
    if (style === 'notebook') {
        finalPrompt = `(Ballpoint pen sketch:1.3) of ${prompt}. Blue ink on white paper. 
        Loose messy lines, student doodle aesthetic. 
        Text: "${topText}" written in messy cursive handwriting. 
        ${labelString}. 
        White notebook paper background, slightly wrinkled texture. High contrast.`;
    } else {
        // Standard "Explain" Whiteboard Look
        finalPrompt = `(Whiteboard animation style:1.4) marker drawing of ${prompt}. 
        Thick black ink outlines, vector art style, simple infographic aesthetic. 
        Colors: Cyan, Orange, Purple highlights. 
        Text: "${topText}" written in bold hand-lettered marker font. 
        ${labelString}.
        Pure white background, no shading, flat design, expressive stick figures, macro view.`;
    }

    // Using Imagen 4 for high-quality, fast generation
    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: finalPrompt,
      config: {
        numberOfImages: 1, // Batch size 1 to keep per-scene cost low
        aspectRatio: aspectRatio,
        outputMimeType: 'image/jpeg',
      }
    });

    const base64 = response.generatedImages?.[0]?.image?.imageBytes;
    
    if (!base64) throw new Error("No image data found from Imagen");
    
    return `data:image/jpeg;base64,${base64}`;

  }, 5, 2000, onStatusUpdate); 
};

export const generateSpeech = async (text: string, voiceName: VoiceName, audioCtx: AudioContext, onStatusUpdate?: (status: string) => void): Promise<AudioBuffer> => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const rawBytes = decodeBase64(base64Audio);
    return await decodePCMData(rawBytes, audioCtx, 24000, 1);
  }, 5, 1000, onStatusUpdate);
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodePCMData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
