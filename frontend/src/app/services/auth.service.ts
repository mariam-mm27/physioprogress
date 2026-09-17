import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type UserRole = 'patient' | 'therapist';

export interface AuthUser {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isConfirmed: boolean;
  therapistCode?: string;
  patientCode?: string;
  injuryType?: string;
  specialization?: string[];
  bio?: string;
  assignedTherapist?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    user?: AuthUser;
    therapistCode?: string;
    patientCode?: string;
  };
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  injuryType?: string;
  therapistCode?: string;
  specialization?: string[];
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 private apiUrl = '/api/auth';
  private readonly tokenKey = 'token';
  private readonly roleKey = 'role';
  private readonly userKey = 'user';

  constructor(private http: HttpClient) { }

  register(userData: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  login(email: string, password: string, role?: UserRole): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password,
      role
    }).pipe(
      tap((res) => {
        if (res.data?.accessToken) {
          const user = res.data.user;
          const userRole = (user?.role || role || 'patient') as UserRole;
          this.setSession(res.data.accessToken, userRole, user);
        }
      })
    );
  }

  confirmEmail(email: string, confirmOTP: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/confirm-email`, {
      email,
      confirmOTP
    }).pipe(
      tap((res) => {
        if (res.data?.accessToken) {
          const user = res.data.user;
          const userRole = (user?.role || 'patient') as UserRole;
          this.setSession(res.data.accessToken, userRole, user);
        }
      })
    );
  }

  googleAuth(idToken: string, role?: UserRole): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, {
      idToken,
      role
    }).pipe(
      tap((res) => {
        if (res.data?.accessToken) {
          const user = res.data.user;
          const userRole = (user?.role || role || 'patient') as UserRole;
          this.setSession(res.data.accessToken, userRole, user);
        }
      })
    );
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

  getMe(token?: string): Observable<AuthResponse> {
    const t = token || this.token;
    const headers = t ? new HttpHeaders({ Authorization: `Bearer ${t}` }) : undefined;
    return this.http.get<AuthResponse>(`${this.apiUrl}/me`, { headers }).pipe(
      tap((res) => {
        if (res.data?.user) {
          localStorage.setItem(this.userKey, JSON.stringify(res.data.user));
          if (res.data.user.role) {
            localStorage.setItem(this.roleKey, res.data.user.role);
          }
        }
      })
    );
  }

  fetchMe(): Observable<AuthResponse> {
    return this.getMe();
  }

  setSession(token: string, role: string, user?: AuthUser | null): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role.toLowerCase());
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return this.token;
  }

  get user(): AuthUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  get role(): UserRole | null {
    const r = localStorage.getItem(this.roleKey);
    if (r === 'patient' || r === 'therapist') return r;
    return this.user?.role ?? null;
  }

  getRole(): string | null {
    return this.role;
  }

  get therapistCode(): string | null {
    return this.user?.therapistCode ?? null;
  }

  get patientCode(): string | null {
    return this.user?.patientCode ?? null;
  }
}
