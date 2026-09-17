export interface Exercise {
  name: string;
  gifUrl: string;
  bodyParts: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
}

export interface ExerciseSearchResponse {
  success: boolean;
  results: number;
  data: Exercise[];
}
