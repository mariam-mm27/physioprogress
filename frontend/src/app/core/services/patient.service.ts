import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExercisePlan, SessionLogPayload } from '../models/patient-dashboard';

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

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getPatientPlans(patientId: string): Observable<ExercisePlansResponse> {
    return this.http.get<ExercisePlansResponse>(
      `${this.baseUrl}/plans/${patientId}`
    );
  }

  logSession(payload: SessionLogPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/logs`, payload);
  }
}