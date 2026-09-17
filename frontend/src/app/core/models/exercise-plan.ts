export interface ExercisePlan {
  _id: string;
  therapistId: string;
  patientId: string;
  title: string;
  exerciseName: string;
  reps: number;
  frequencyPerWeek: number;
  videoUrl: string;
  targetMuscle: string;
  customMuscle?: string;
  videoSource: 'custom' | 'api';
  createdAt?: string;
  updatedAt?: string;
}

export interface ExercisePlansResponse {
  success: boolean;
  results?: number;
  data: ExercisePlan[];
  pagination?: {
    currentPage: number;
    limit: number;
    totalPlans: number;
    totalPages: number;
  };
}
