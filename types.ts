export interface Step {
  stepNumber: number;
  instruction: string; // The technical instruction
  storyPart: string;   // The fun story narrative
}

export interface StoryResponse {
  title: string;
  intro: string;
  steps: Step[];
  conclusion: string;
}

export enum AppState {
  IDLE,
  LOADING,
  READY,
  ERROR
}