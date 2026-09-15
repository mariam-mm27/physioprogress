export interface SessionLog {
  _id: string;
  patientId: string;
  planId: string;
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