import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PatientData {
  _id: string;
  fullName: string;
  email: string;
  patientCode: string;
  injuryType: string;
  profilePicture?: {
    url: string;
  };
  role: string;
}

export interface PatientWithAnalytics extends PatientData {
  painLevel: number;
  programAdherence: number;
  totalSessions: number;
  injuryType: string;
}

export interface DashboardStats {
  enrolledPatients: number;
  activePlans: number;
  clinicalAdherence: number;
  telemetrySessions: number;
}

export interface TherapistDashboardData {
  stats: DashboardStats;
  patients: PatientWithAnalytics[];
  averagePainLevel: number;
  averageAdherence: number;
}

@Injectable({
  providedIn: 'root'
})
export class TherapistService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}


  getTherapistPatients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/therapist/patients`);
  }

  /**
   * Get specific patient details
   */
  getPatientDetails(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${patientId}`);
  }

  /**
   * Get exercise plans for a specific patient
   */
  getPatientExercisePlans(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/plans/${patientId}`);
  }

  /**
   * Get analytics for a patient (weekly)
   */
  getPatientWeeklyAnalytics(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/patient/${patientId}/weekly`);
  }

  /**
   * Get analytics for a patient (monthly)
   */
  getPatientMonthlyAnalytics(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/patient/${patientId}/monthly`);
  }

  /**
   * Get session logs for a patient
   */
  getPatientSessionLogs(patientId: string, startDate?: string, endDate?: string): Observable<any> {
    let params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return this.http.get(`${this.apiUrl}/logs/patient/${patientId}`, { params });
  }

  /**
   * Get unassigned patients
   */
  getUnassignedPatients(page: number = 1, limit: number = 100): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/unassigned-patients`, {
      params: { page, limit }
    }).pipe(timeout(15000));
  }

  /**
   * Assign a patient to therapist
   */
  assignPatient(patientCode: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/assign-patient`, { patientCode }).pipe(
      timeout(10000),
      catchError(error => {
        console.error('Assignment error:', error);
        if (error.name === 'TimeoutError') {
          return throwError(() => ({ message: 'Request timed out. Please try again.' }));
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Get dashboard data - combining all stats
   */
  getDashboardData(): Observable<TherapistDashboardData> {
    return this.http.get<TherapistDashboardData>(`${this.apiUrl}/therapist/dashboard`);
  }
}
