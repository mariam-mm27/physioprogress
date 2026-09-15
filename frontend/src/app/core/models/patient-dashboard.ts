export interface ExercisePlan {
  _id: string;
  title: string;
  exerciseName: string;
  reps: number;
  frequencyPerWeek: number;
  videoUrl: string;
  targetMuscle: string;
  customMuscle?: string;
  videoSource: 'custom' | 'api';
}


export interface PatientAnalytics {
  period: 'weekly' | 'monthly';
  adherenceRate: number;
  averagePainLevel: number;
  completedSessions: number;
  expectedSessions: number;
  totalSessionLogs: number;
}

export interface SessionLogPayload {
  planId: string;
  completed: boolean;
  painLevel: number;
  notes?: string;
  loggedAt?: string;
}