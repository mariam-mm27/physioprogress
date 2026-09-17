import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router: Router = inject(Router);

  let requiredRole = route.data?.['role'] as UserRole | undefined;
  if (!requiredRole && route.parent?.data?.['role']) {
    requiredRole = route.parent.data['role'];
  }

  if (!authService.isAuthenticated()) {
    console.warn('[authGuard] Not authenticated, redirecting to login.');
    authService.logout();
    router.navigate(['/auth'], {
      queryParams: { mode: 'login', returnUrl: state.url }
    });
    return false;
  }

  const role = authService.role;
  if (requiredRole && role !== requiredRole) {
    console.warn(`[authGuard] Role mismatch! Required: ${requiredRole}, Actual: ${role}`);
    if (role === 'patient') {
      router.navigate(['/patient/patient-dashboard']);
    } else if (role === 'therapist') {
      router.navigate(['/therapist/therapist-dashboard']);
    } else {
      router.navigate(['/']);
    }
    return false;
  }

  return true;
};
export const guestGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router: Router = inject(Router);

  if (authService.isAuthenticated()) {
    const role = authService.role;
    if (role === 'patient') {
      router.navigate(['/patient/patient-dashboard']);
    } else if (role === 'therapist') {
      router.navigate(['/therapist/therapist-dashboard']);
    } else {
      router.navigate(['/']);
    }
    return false;
  }

  return true;
};