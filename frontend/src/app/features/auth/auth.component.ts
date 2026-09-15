import { Component, OnInit, AfterViewInit, NgZone, Inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { PageSectionComponent } from '../../shared/components/page-section/page-section.component';
import { AuthService, AuthResponse } from '../../services/auth.service';

declare const google: any;

type UserRole = 'patient' | 'therapist';
type AuthIntent = 'login' | 'register';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
    PageSectionComponent
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit, AfterViewInit {
  @ViewChild('googleBtnHost') googleBtnHostRef!: ElementRef<HTMLDivElement>;

  currentRole: UserRole = 'patient';
  currentIntent: AuthIntent = 'register';
  authForm!: FormGroup;
  loading = false;
  googleLoading = false;
  googleLoaded = false;
  error: string | null = null;
  successMessage: string | null = null;
  unconfirmedEmail: string | null = null;
  showTherapistCodeModal = false;
  therapistCode = '';

  private readonly googleClientId = '650360803188-onocvgape22fnq80irtos38lqvf55p4f.apps.googleusercontent.com';

  readonly injuryTypes = [
    'ACL Reconstruction (Right Knee)',
    'Rotator Cuff Tear (Supraspinatus)',
    'Lumbar Disc Herniation (L4-S1)',
    'Post-Op Knee Replacement (Total)',
    'Achilles Tendinopathy (Chronic)',
    'Other / Complex Orthopedic'
  ];

  readonly specializations = [
    'Orthopedic PT',
    'Sports Rehabilitation',
    'Neurology',
    'Spine & Posture',
    'Pediatric PT'
  ];

  selectedSpecializations = new Set<string>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.handleQueryParams();
  }

  ngAfterViewInit(): void {
    this.initGoogleAuth();
  }

  private handleQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      const mode = params['mode'];
      if (mode === 'login') {
        this.currentIntent = 'login';
      } else if (mode === 'register') {
        this.currentIntent = 'register';
      }
      this.updateFormValidators();
      setTimeout(() => this.renderGoogleButton(), 100);
    });
  }

  initializeForm(): void {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator()]],
      fullName: [''],
      injuryType: [''],
      therapistCode: [''],
      bio: ['', Validators.maxLength(500)]
    });
  }

  private passwordValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
      return hasSpecialChar ? null : { noSpecialChar: true };
    };
  }

  updateFormValidators(): void {
    const fullNameControl = this.authForm.get('fullName');
    const injuryControl = this.authForm.get('injuryType');
    const bioControl = this.authForm.get('bio');
    const passwordControl = this.authForm.get('password');

    if (this.currentIntent === 'register') {
      fullNameControl?.setValidators([Validators.required]);
      passwordControl?.setValidators([Validators.required, Validators.minLength(6), this.passwordValidator()]);
    } else {
      fullNameControl?.clearValidators();
      passwordControl?.setValidators([Validators.required]);
    }

    if (this.currentRole === 'patient' && this.currentIntent === 'register') {
      injuryControl?.setValidators([Validators.required]);
    } else {
      injuryControl?.clearValidators();
    }

    fullNameControl?.updateValueAndValidity();
    passwordControl?.updateValueAndValidity();
    injuryControl?.updateValueAndValidity();
    bioControl?.updateValueAndValidity();
  }

  switchRole(role: UserRole): void {
    if (this.currentRole === role) return;
    this.currentRole = role;
    this.error = null;
    this.successMessage = null;
    this.unconfirmedEmail = null;
    this.selectedSpecializations.clear();
    this.resetFormState();
    setTimeout(() => this.renderGoogleButton(), 50);
  }

  switchIntent(intent: AuthIntent): void {
    if (this.currentIntent === intent) return;
    this.currentIntent = intent;
    this.error = null;
    this.successMessage = null;
    this.unconfirmedEmail = null;
    this.resetFormState();
    setTimeout(() => this.renderGoogleButton(), 50);
  }

  private resetFormState(): void {
    this.authForm.reset({
      email: '',
      password: '',
      fullName: '',
      injuryType: '',
      therapistCode: '',
      bio: ''
    });
    this.authForm.markAsPristine();
    this.authForm.markAsUntouched();
    this.updateFormValidators();
  }

  toggleSpecialization(spec: string): void {
    if (this.selectedSpecializations.has(spec)) {
      this.selectedSpecializations.delete(spec);
    } else {
      this.selectedSpecializations.add(spec);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.authForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(fieldName: string): string {
    const control = this.authForm.get(fieldName);
    if (!control?.errors || !(control.dirty || control.touched)) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Enter a valid email address';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['noSpecialChar']) return 'Password must contain at least one special character (!@#$%^&*)';
    if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} characters`;

    return 'Invalid input';
  }

  onSubmit(): void {
    this.error = null;
    this.successMessage = null;
    this.unconfirmedEmail = null;

    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      this.error = 'Please fill out all required fields correctly.';
      return;
    }

    if (this.currentIntent === 'register') {
      if (this.currentRole === 'therapist' && this.selectedSpecializations.size === 0) {
        this.error = 'Please select at least one clinical specialization.';
        return;
      }
    }

    this.loading = true;

    if (this.currentIntent === 'login') {
      this.handleLogin();
    } else {
      this.handleRegister();
    }
  }

  private handleLogin(): void {
    const { email, password } = this.authForm.value;
    const cleanEmail = email.trim().toLowerCase();

    this.authService.login(cleanEmail, password, this.currentRole).subscribe({
      next: (response: AuthResponse) => {
        this.loading = false;
        if (response.data?.accessToken) {
          localStorage.setItem('token', response.data.accessToken);
          localStorage.setItem('role', this.currentRole);
          this.navigateAfterAuth();
        } else {
          this.error = 'Authentication succeeded but no session token was received.';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const errMsg = err.error?.message || (err.status === 0 ? 'Cannot connect to backend server on http://localhost:8000. Please ensure the backend is running.' : 'Login failed. Please check your credentials and try again.');
        this.error = errMsg;
        if (errMsg.toLowerCase().includes('confirm')) {
          this.unconfirmedEmail = cleanEmail;
        }
      }
    });
  }

  private handleRegister(): void {
    const { fullName, email, password, injuryType, therapistCode, bio } = this.authForm.value;
    const cleanEmail = email.trim().toLowerCase();

    const payload: any = {
      fullName: fullName?.trim(),
      email: cleanEmail,
      password,
      role: this.currentRole
    };

    if (this.currentRole === 'patient') {
      payload.injuryType = injuryType;
      if (therapistCode?.trim()) {
        payload.therapistCode = therapistCode.trim();
      }
    } else if (this.currentRole === 'therapist') {
      payload.specialization = Array.from(this.selectedSpecializations);
      if (bio?.trim()) {
        payload.bio = bio.trim();
      }
    }

    this.authService.register(payload).subscribe({
      next: (response: AuthResponse) => {
        this.loading = false;
        const code = (response.data as any)?.therapistCode;
        if (this.currentRole === 'therapist' && code) {
          this.therapistCode = code;
          this.showTherapistCodeModal = true;
        } else {
          this.successMessage = 'Registration successful! Please check your email for a verification code.';
          setTimeout(() => {
            this.router.navigate(['/auth/confirm-email'], {
              queryParams: { email: cleanEmail }
            });
          }, 1200);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const msg = err.error?.message ||
          (err.status === 0
            ? 'Cannot connect to backend server on http://localhost:8000. Please ensure the backend is running.'
            : 'Registration failed. Please verify your details and try again.');
        this.error = msg;
        if (msg.toLowerCase().includes('confirm') || msg.toLowerCase().includes('verify')) {
          this.unconfirmedEmail = cleanEmail;
        }
      }
    });
  }

  goToVerifyEmail(): void {
    if (this.unconfirmedEmail) {
      this.router.navigate(['/auth/confirm-email'], {
        queryParams: { email: this.unconfirmedEmail }
      });
    }
  }

  private navigateAfterAuth(): void {
    const targetRoute = `/${this.currentRole}`;
    this.router.navigate([targetRoute]).catch(() => {
      this.router.navigate(['/']);
    });
  }

  copyTherapistCode(): void {
    navigator.clipboard.writeText(this.therapistCode);
    alert('Therapist code copied to clipboard!');
  }

  closeTherapistCodeModal(): void {
    this.showTherapistCodeModal = false;
    const email = this.authForm.get('email')?.value;
    if (email) {
      this.router.navigate(['/auth/confirm-email'], { queryParams: { email: email.trim() } });
    } else {
      this.switchIntent('login');
    }
  }

  // --- Google OAuth  ---
  private initGoogleAuth(): void {
    if (typeof window === 'undefined') return;

    if (typeof google === 'undefined') {
      const existingScript = this.document.getElementById('google-jssdk');
      if (!existingScript) {
        const script = this.document.createElement('script');
        script.id = 'google-jssdk';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.ngZone.run(() => {
            this.googleLoaded = true;
            this.renderGoogleButton();
          });
        };
        script.onerror = () => {
          console.warn('Google Identity Services script failed to load');
        };
        this.document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', () => {
          this.ngZone.run(() => {
            this.googleLoaded = true;
            this.renderGoogleButton();
          });
        });
      }
    } else {
      this.googleLoaded = true;
      this.renderGoogleButton();
    }
  }

  renderGoogleButton(): void {
    if (typeof google === 'undefined' || !google.accounts?.id) {
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (response: any) => this.handleGoogleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const host = this.googleBtnHostRef?.nativeElement || document.getElementById('googleBtnHost');
      if (host) {
        host.innerHTML = '';
        google.accounts.id.renderButton(host, {
          theme: 'filled_black',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: this.currentIntent === 'login' ? 'signin_with' : 'signup_with',
          logo_alignment: 'left',
          width: host.parentElement?.clientWidth ? Math.min(host.parentElement.clientWidth, 480) : 380
        });
        this.googleLoaded = true;
      }
    } catch (err) {
      console.warn('Could not render Google button:', err);
    }
  }

  triggerGoogleAuth(): void {
    this.error = null;
    this.googleLoading = true;

    if (typeof google === 'undefined' || !google.accounts?.id) {
      this.googleLoading = false;
      this.error = 'Google Sign-In is initializing. Please wait a moment and try again.';
      this.initGoogleAuth();
      return;
    }

    try {
      const host = this.googleBtnHostRef?.nativeElement || document.getElementById('googleBtnHost');
      const googleBtn = host?.querySelector('[role="button"]') as HTMLElement | null;
      if (googleBtn) {
        this.googleLoading = false;
        googleBtn.click();
        return;
      }

      google.accounts.id.prompt((notification: any) => {
        this.ngZone.run(() => {
          this.googleLoading = false;
          if (notification.isNotDisplayed()) {
            this.error = 'Google Sign-In popup was blocked. Please use the Google button directly or allow popups for this site.';
          } else if (notification.isSkippedMoment()) {
          }
        });
      });
    } catch (e) {
      this.googleLoading = false;
      this.error = 'Unable to launch Google Sign-In. Please check your browser popup settings.';
    }
  }

  private handleGoogleCredentialResponse(response: any): void {
    this.ngZone.run(() => {
      this.googleLoading = true;
      if (!response?.credential) {
        this.googleLoading = false;
        this.error = 'Google authentication was cancelled or failed to retrieve token.';
        return;
      }

      this.authService.googleAuth(response.credential, this.currentRole).subscribe({
        next: (authRes: AuthResponse) => {
          this.googleLoading = false;
          if (authRes.data?.accessToken) {
            localStorage.setItem('token', authRes.data.accessToken);
            const role = authRes.data.user?.role || this.currentRole;
            localStorage.setItem('role', role);
            if (authRes.data.user) {
              localStorage.setItem('user', JSON.stringify(authRes.data.user));
            }
            this.navigateAfterAuth();
          } else {
            this.error = 'Google login succeeded, but no session token was received.';
          }
        },
        error: (err: HttpErrorResponse) => {
          this.googleLoading = false;
          const msg = err.error?.message ||
            (err.status === 0
              ? 'Backend server unreachable. Please make sure the backend is running.'
              : 'Google authentication failed. Please try again.');
          this.error = msg;
        }
      });
    });
  }
}
