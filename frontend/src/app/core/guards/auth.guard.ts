import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';

/**
 * Ensures that only authenticated users with the appropriate role can access protected routes.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // For child routes, route.data might not contain role if it's on the parent.
  // We can traverse route to find data.role if needed, but in this setup 
  // patientRoutes sets data on the root path 'patient'.
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

/**
 * Prevents logged-in users from accessing guest-only routes like /auth, /auth/forgot-password.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

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