import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PatientsResponse } from '../models/patient';
import {
  SessionLogsResponse,
  CreateSessionLogPayload,
  UpdateSessionLogPayload,
  DeleteSessionLogResponse,
} from '../models/session-log';
import { AnalyticsPeriod, PatientAnalyticsResponse } from '../models/analytics';

@Injectable({ providedIn: 'root' })
export class SessionLogService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getAssignedPatients(limit = 100): Observable<PatientsResponse> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<PatientsResponse>(`${this.baseUrl}/users/patients`, { params });
  }

  getPatientLogs(patientId: string, startDate?: string, endDate?: string): Observable<SessionLogsResponse> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<SessionLogsResponse>(`${this.baseUrl}/logs/patient/${patientId}`, { params });
  }

  getPatientAnalytics(patientId: string, period: AnalyticsPeriod): Observable<PatientAnalyticsResponse> {
    return this.http.get<PatientAnalyticsResponse>(`${this.baseUrl}/analytics/patient/${patientId}/${period}`);
  }

  createLog(payload: CreateSessionLogPayload): Observable<SessionLogsResponse> {
    return this.http.post<SessionLogsResponse>(`${this.baseUrl}/logs`, payload);
  }

  /** PUT /api/logs/:id — Update existing session log */
  updateLog(id: string, payload: UpdateSessionLogPayload): Observable<SessionLogsResponse> {
    return this.http.put<SessionLogsResponse>(`${this.baseUrl}/logs/${id}`, payload);
  }

  /** DELETE /api/logs/:id — Delete existing session log */
  deleteLog(id: string): Observable<DeleteSessionLogResponse> {
    return this.http.delete<DeleteSessionLogResponse>(`${this.baseUrl}/logs/${id}`);
  }
}
