export type AnalyticsPeriod = 'weekly' | 'monthly';

export interface PatientAnalytics {
  period: AnalyticsPeriod;
  adherenceRate: number;
  averagePainLevel: number;
  completedSessions: number;
  expectedSessions: number;
  totalSessionLogs: number;
}

export interface PatientAnalyticsResponse {
  success: boolean;
  data: PatientAnalytics;
}