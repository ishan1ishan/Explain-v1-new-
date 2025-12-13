
export interface Scene {
  id: number;
  visual_idea: string;
  gen_prompt: string;
  startTime: number; // in seconds
  duration: number; // in seconds
}

export interface GeneratedImage {
  sceneId: number;
  imageUrl: string | null;
  loading: boolean;
  error?: string;
}

export type GenerationStatus = 'idle' | 'scripting' | 'audio-gen' | 'visual-gen' | 'complete' | 'error';

export type VideoDuration = '5s' | '15s' | '30s' | '1min' | '2min' | '5min' | '25min';
export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
export type VideoPitch = 'low' | 'normal' | 'high';
export type AspectRatio = '16:9' | '9:16' | '1:1';
export type VisualStyle = 'hand-drawn' | 'crayonic' | 'corporate' | 'minimalist' | 'notebook';
export type InputMode = 'prompt' | 'script';
export type MusicStyle = 'none' | 'finance' | 'education' | 'tech' | 'cinematic';

export interface InputFile {
  name: string;
  data: string; // base64
  mimeType: string;
}

export interface AppConfig {
  duration: VideoDuration;
  voice: VoiceName;
  pitch: VideoPitch;
  aspectRatio: AspectRatio;
  visualStyle: VisualStyle;
  language: string;
  inputMode: InputMode;
  musicStyle: MusicStyle;
  logoData: string | null; // base64 of uploaded logo
}

export interface ScriptScene {
    voiceover: string;
    visualPrompt: {
        idea: string;
        prompt: string;
        top_text: string; // The opening words of the sentence
        labels: string[];
    };
}

export interface FullScript {
    scenes: ScriptScene[];
    estimatedCost?: number; // Real-time cost tracking
}
