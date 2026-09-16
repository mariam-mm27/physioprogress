import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PatientsResponse } from '../models/patient';
import { SessionLogsResponse } from '../models/session-log';
import { AnalyticsPeriod, PatientAnalyticsResponse } from '../models/analytics';

/**
 * Every method here calls an endpoint that already existed in the backend
 * before this feature was built — no new routes required.
 */
@Injectable({ providedIn: 'root' })
export class SessionLogService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  /** GET /api/users/patients — existing, therapist's assigned patients. */
  getAssignedPatients(limit = 100): Observable<PatientsResponse> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<PatientsResponse>(`${this.baseUrl}/users/patients`, { params });
  }

  /**
   * GET /api/logs/patient/:patientId — existing. Single patient only, returns
   * the full matching array (no pagination support on the backend).
   */
  getPatientLogs(patientId: string, startDate?: string, endDate?: string): Observable<SessionLogsResponse> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<SessionLogsResponse>(`${this.baseUrl}/logs/patient/${patientId}`, { params });
  }

  /**
   * GET /api/analytics/patient/:patientId/weekly|monthly — existing.
   * Note: these endpoints compute their own fixed 7/30-day window server-side
   * and ignore any date filter, so the caller can only choose which fixed
   * window to ask for, not a custom range.
   */
  getPatientAnalytics(patientId: string, period: AnalyticsPeriod): Observable<PatientAnalyticsResponse> {
    return this.http.get<PatientAnalyticsResponse>(`${this.baseUrl}/analytics/patient/${patientId}/${period}`);
  }
}