export interface ExercisePlan {
  _id: string;
  title: string;
  exerciseName: string;
  reps: number;
  frequencyPerWeek: number;
  videoUrl: string;
  targetMuscle: string;
  videoSource: 'custom' | 'api';
}

export interface SessionLog {
  _id: string;
  patientId: string;
  planId: string | ExercisePlan | null;
  completed: boolean;
  painLevel: number;
  notes?: string;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionLogsResponse {
  success: boolean;
  message: string;
  results: number;
  data: SessionLog[];
}

export interface CreateSessionLogPayload {
  planId: string;
  painLevel: number;
  completed?: boolean;
  notes?: string;
  loggedAt?: string;
}


export interface UpdateSessionLogPayload {
  painLevel?: number;
  completed?: boolean;
  notes?: string;
}

export interface DeleteSessionLogResponse {
  success: boolean;
  message: string;
}

