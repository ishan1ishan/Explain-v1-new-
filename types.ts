
export interface Scene {
  id: number;
  visual_idea: string;
  gen_prompt: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  top_text?: string;
  labels?: string[];
}

export interface GeneratedImage {
  sceneId: number;
  imageUrl: string | null;
  loading: boolean;
  error?: string;
}

export type GenerationStatus = 'idle' | 'scripting' | 'audio-gen' | 'visual-gen' | 'rendering' | 'complete' | 'error';

export type VideoDuration = '5s' | '15s' | '30s' | '1min' | '2min' | '5min';
export type VideoQuality = '720p' | '1080p';
export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
export type VideoPitch = 'low' | 'normal' | 'high';
export type AspectRatio = '16:9' | '9:16' | '1:1';
export type VisualStyle = 'hand-drawn' | 'notebook' | 'blueprint' | 'neon';
export type InputMode = 'prompt' | 'script';
export type MusicStyle = 'none' | 'lofi' | 'corporate' | 'energetic' | 'suspense' | 'calm';

export interface InputFile {
  name: string;
  data: string; // base64
  mimeType: string;
}

export interface AppConfig {
  duration: VideoDuration;
  quality: VideoQuality;
  voice: VoiceName;
  pitch: VideoPitch;
  aspectRatio: AspectRatio;
  visualStyle: VisualStyle;
  language: string;
  inputMode: InputMode;
  musicStyle: MusicStyle;
  logoData: string | null;
  useColor: boolean; // New option for Color vs B&W
}

export interface ScriptScene {
    voiceover: string;
    visualPrompt: {
        idea: string;
        prompt: string;
        top_text: string;
        labels: string[];
    };
}

export interface FullScript {
    scenes: ScriptScene[];
}

export interface VideoDocument {
  id: string;
  uid: string;
  title: string;
  status: 'processing' | 'completed' | 'failed';
  duration: string;
  videoUrl: string;
  createdAt: Date;
}
