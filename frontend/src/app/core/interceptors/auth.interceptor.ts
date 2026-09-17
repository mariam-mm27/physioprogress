import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken() ?? authService.token;

  console.log('🔥 [authInterceptor] Processing request:', req.url);
  console.log('🔥 [authInterceptor] Token available:', !!token);

  let authReq = req;
  if (token && !req.url.includes('google')) {
    console.log('🔥 [authInterceptor] Adding authorization header');
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  } else if (!token) {
    console.warn('🔥 [authInterceptor] No token found!');
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('🔥 [authInterceptor] Error received:', error.status, error.statusText);
      if (error.status === 401) {
        console.error('🔥 [authInterceptor] Unauthorized - logging out');
        authService.logout();
        router.navigate(['/auth'], { queryParams: { mode: 'login' } });
      }
      return throwError(() => error);
    })
  );
};
