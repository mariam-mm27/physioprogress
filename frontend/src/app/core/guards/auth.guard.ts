import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required = route.data?.['role'] as 'therapist' | 'patient' | undefined;

  if (!auth.isAuthenticated()) {
    auth.logout();
    router.navigate(['/login']);
    return false;
  }

  const role = auth.role;
  if (required && role !== required) {
    router.navigate(role === 'patient' ? ['/patient'] : ['/therapist-dashboard']);
    return false;
  }

  return true;
};