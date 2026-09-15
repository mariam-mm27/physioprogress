import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    user?: {
      _id: string;
      email: string;
      fullName: string;
      role: 'patient' | 'therapist';
      isConfirmed: boolean;
      therapistCode?: string;
      patientCode?: string;
    };
    therapistCode?: string;
    patientCode?: string;
  };
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: 'patient' | 'therapist';
  injuryType?: string;
  therapistCode?: string;
  specialization?: string[];
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth';

  constructor(private http: HttpClient) {}

  register(userData: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  login(email: string, password: string, role: 'patient' | 'therapist'): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password,
      role
    });
  }

  confirmEmail(email: string, confirmOTP: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/confirm-email`, {
      email,
      confirmOTP
    });
  }

  googleAuth(idToken: string, role: 'patient' | 'therapist'): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, {
      idToken,
      role
    });
  }

  forgetPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forget-password`, {
      email
    });
  }

  resetPassword(token: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password/${token}`, {
      password
    });
  }

  resendOTP(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/resend-otp`, { email });
  }

  getMe(token: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<AuthResponse>(`${this.apiUrl}/me`, { headers });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }
}
