import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type UserRole = 'therapist' | 'patient';

export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'physio_token';
  private readonly userKey = 'physio_user';

  constructor(private http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
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

  get role(): UserRole | null {
    return this.user?.role ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.role;
  }

  login(email: string, password: string): Observable<{ success: boolean; data: { accessToken: string } }> {
    return this.http
      .post<{ success: boolean; data: { accessToken: string } }>('/api/auth/login', { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.data.accessToken);
        }),
      );
  }

  fetchMe(): Observable<{ success: boolean; data: AuthUser }> {
    return this.http
      .get<{ success: boolean; data: AuthUser }>('/api/auth/me')
      .pipe(
        tap((res) => {
          localStorage.setItem(this.userKey, JSON.stringify(res.data));
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
}