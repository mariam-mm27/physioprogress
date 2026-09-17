// import { Injectable, inject } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';
// import { PatientsResponse } from '../models/patient';
// import { ExerciseSearchResponse } from '../models/exercise';

// @Injectable({ providedIn: 'root' })
// export class ExercisePlanService {
//   private http = inject(HttpClient);
//   private baseUrl = environment.apiUrl;

//   getAssignedPatients(): Observable<PatientsResponse> {
//     return this.http.get<PatientsResponse>(`${this.baseUrl}/users/patients`);
//   }

//   searchExercises(muscle: string): Observable<ExerciseSearchResponse> {
//     const params = new HttpParams().set('muscle', muscle);

//     return this.http.get<ExerciseSearchResponse>(
//       `${this.baseUrl}/exercises/search`,
//       { params }
//     );
//   }

// }



import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  ExercisePlan,
  ExercisePlansResponse
} from '../models/exercise-plan';

import {
  ExerciseSearchResponse
} from '../models/exercise';

import {
  AssignedPatient,
  PatientsResponse
} from '../models/patient';

export interface CreateExercisePlanPayload {
  title: string;
  exerciseName: string;
  reps: number;
  frequencyPerWeek: number;
  videoUrl: string;
  targetMuscle: string;
  customMuscle?: string;
  videoSource: 'custom' | 'api';
}

export interface UpdateExercisePlanPayload {
  title?: string;
  exerciseName?: string;
  reps?: number;
  frequencyPerWeek?: number;
  videoUrl?: string;
  targetMuscle?: string;
  customMuscle?: string;
  videoSource?: 'custom' | 'api';
}

export interface ExercisePlanResponse {
  success: boolean;
  message?: string;
  data: ExercisePlan;
}

export interface DeleteExercisePlanResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExercisePlanService {

  private http = inject(HttpClient);

  private baseUrl = environment.apiUrl;

  // =========================
  // PATIENTS
  // =========================

  getAssignedPatients(): Observable<PatientsResponse> {
    return this.http.get<PatientsResponse>(
      `${this.baseUrl}/users/patients`
    );
  }

  // =========================
  // EXERCISE DATABASE
  // =========================

  searchExercises(
    muscle: string
  ): Observable<ExerciseSearchResponse> {

    const params = new HttpParams()
      .set('muscle', muscle);

    return this.http.get<ExerciseSearchResponse>(
      `${this.baseUrl}/exercises/search`,
      { params }
    );
  }

  // =========================
  // CREATE PLAN
  // =========================

  createExercisePlan(
    patientId: string,
    plan: CreateExercisePlanPayload
  ): Observable<ExercisePlanResponse> {

    return this.http.post<ExercisePlanResponse>(
      `${this.baseUrl}/plans/${patientId}`,
      plan
    );
  }

  // =========================
  // GET PATIENT PLANS
  // =========================

  getExercisePlans(
    patientId: string,
    page = 1,
    limit = 10,
    sort = '-createdAt'
  ): Observable<ExercisePlansResponse> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('sort', sort);

    return this.http.get<ExercisePlansResponse>(
      `${this.baseUrl}/plans/${patientId}`,
      { params }
    );
  }

  // =========================
  // UPDATE PLAN
  // =========================

  updateExercisePlan(
    planId: string,
    plan: UpdateExercisePlanPayload
  ): Observable<ExercisePlanResponse> {

    return this.http.put<ExercisePlanResponse>(
      `${this.baseUrl}/plans/${planId}`,
      plan
    );
  }

  // =========================
  // DELETE PLAN
  // =========================

  deleteExercisePlan(
    planId: string
  ): Observable<DeleteExercisePlanResponse> {

    return this.http.delete<DeleteExercisePlanResponse>(
      `${this.baseUrl}/plans/${planId}`
    );
  }
}
