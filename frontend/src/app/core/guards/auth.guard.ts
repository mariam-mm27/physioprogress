import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data?.['role'] as 'therapist' | 'patient' | undefined;

  if (!authService.isAuthenticated()) {
    authService.logout();
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  const role = authService.role;
  if (requiredRole && role !== requiredRole) {
    router.navigate(role === 'patient' ? ['/patient'] : ['/therapist-dashboard']);
    return false;
  }

  return true;
};