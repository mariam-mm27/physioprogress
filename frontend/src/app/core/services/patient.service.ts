import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ExercisePlan,
  SessionLogPayload
} from '../models/patient-dashboard';

export interface ExercisePlansResponse {
  message: string;
  exercisePlans: ExercisePlan[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPlans: number;
    totalPages: number;
  };
}

export interface SessionLog {
  _id: string;
  patientId: string;
  planId: string;
  completed: boolean;
  painLevel: number;
  notes?: string;
  loggedAt: string;
}

export interface SessionLogsResponse {
  success: boolean;
  message: string;
  results: number;
  data: SessionLog[];
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getPatientPlans(
    patientId: string
  ): Observable<ExercisePlansResponse> {
    return this.http.get<ExercisePlansResponse>(
      `${this.baseUrl}/plans/${patientId}`
    );
  }

  getPatientProfile(
    patientId: string
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/users/${patientId}`
    );
  }

  getPatientSessionLogs(
    patientId: string
  ): Observable<SessionLogsResponse> {
    return this.http.get<SessionLogsResponse>(
      `${this.baseUrl}/logs/patient/${patientId}`
    );
  }

  logSession(
    payload: SessionLogPayload
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/logs`,
      payload
    );
  }

}