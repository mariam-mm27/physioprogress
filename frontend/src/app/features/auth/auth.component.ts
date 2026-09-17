import {
  Component,
  OnInit,
  AfterViewInit,
  NgZone,
  Inject,
  ElementRef,
  ViewChild
} from '@angular/core';

import { CommonModule, DOCUMENT } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  Router,
  ActivatedRoute,
  RouterModule
} from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { PageSectionComponent } from '../../shared/components/page-section/page-section.component';

import {
  AuthService,
  AuthResponse,
  UserRole
} from '../../services/auth.service';

declare const google: any;

type AuthIntent = 'login' | 'register';

@Component({
  selector: 'app-auth',
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

  @ViewChild('googleBtnHost')
  googleBtnHostRef!: ElementRef<HTMLDivElement>;

  currentRole: UserRole = 'patient';
  currentIntent: AuthIntent = 'register';

  authForm!: FormGroup;

  loading = false;
  googleLoading = false;
  googleLoaded = false;

  error: string | null = null;
  successMessage: string | null = null;
  unconfirmedEmail: string | null = null;

  private readonly googleClientId =
    '650360803188-onocvgape22fnq80irtos38lqvf55p4f.apps.googleusercontent.com';

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
    if (this.authService.isAuthenticated()) {
      this.navigateAfterAuth(
        this.authService.role || 'patient'
      );
      return;
    }

    this.initializeForm();
    this.handleQueryParams();
  }

  ngAfterViewInit(): void {
    this.initGoogleAuth();
  }

  private handleQueryParams(): void {
    this.route.queryParams.subscribe(
      (params: Record<string, string>) => {

        const mode = params['mode'];

        if (mode === 'login') {
          this.currentIntent = 'login';
        } else if (mode === 'register') {
          this.currentIntent = 'register';
        }

        if (
          params['role'] === 'therapist' ||
          params['role'] === 'patient'
        ) {
          this.currentRole = params['role'];
        }

        this.updateFormValidators();

        setTimeout(() => {
          this.renderGoogleButton();
        }, 100);
      }
    );
  }

  initializeForm(): void {
    this.authForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          this.passwordValidator()
        ]
      ],

      fullName: [''],

      injuryType: [
        this.injuryTypes[0]
      ],

      bio: ['']
    });

    this.updateFormValidators();
  }

  private passwordValidator() {
    return (control: { value: string }) => {

      const value = control.value || '';

      if (!value) {
        return null;
      }

      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[^A-Za-z0-9]/.test(value);

      const isValid =
        value.length >= 6 &&
        hasUpper &&
        hasLower &&
        (hasNumber || hasSpecial);

      return isValid
        ? null
        : { weakPassword: true };
    };
  }

  updateFormValidators(): void {

    const fullNameControl =
      this.authForm.get('fullName');

    const injuryTypeControl =
      this.authForm.get('injuryType');

    const passwordControl =
      this.authForm.get('password');

    if (this.currentIntent === 'register') {

      passwordControl?.setValidators([
        Validators.required,
        Validators.minLength(6),
        this.passwordValidator()
      ]);

      fullNameControl?.setValidators([
        Validators.required,
        Validators.minLength(2)
      ]);

      if (this.currentRole === 'patient') {

        injuryTypeControl?.setValidators([
          Validators.required
        ]);

      } else {

        injuryTypeControl?.clearValidators();

      }

    } else {

      passwordControl?.setValidators([
        Validators.required,
        Validators.minLength(6)
      ]);

      fullNameControl?.clearValidators();

      injuryTypeControl?.clearValidators();
    }

    passwordControl?.updateValueAndValidity();
    fullNameControl?.updateValueAndValidity();
    injuryTypeControl?.updateValueAndValidity();
  }

  isFieldInvalid(fieldName: string): boolean {

    const control =
      this.authForm.get(fieldName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  getFieldError(fieldName: string): string {

    const control =
      this.authForm.get(fieldName);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required';
    }

    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }

    if (control.errors['minlength']) {

      const min =
        control.errors['minlength'].requiredLength;

      return `Must be at least ${min} characters`;
    }

    if (control.errors['weakPassword']) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number or symbol';
    }

    return 'Invalid field value';
  }

  switchRole(role: UserRole): void {

    if (this.currentRole === role) {
      return;
    }

    this.currentRole = role;

    this.error = null;
    this.successMessage = null;

    this.updateFormValidators();

    setTimeout(() => {
      this.renderGoogleButton();
    }, 100);
  }

  switchIntent(intent: AuthIntent): void {

    if (this.currentIntent === intent) {
      return;
    }

    this.currentIntent = intent;

    this.error = null;
    this.successMessage = null;

    this.updateFormValidators();

    setTimeout(() => {
      this.renderGoogleButton();
    }, 100);
  }

  toggleSpecialization(spec: string): void {

    if (this.selectedSpecializations.has(spec)) {
      this.selectedSpecializations.delete(spec);
    } else {
      this.selectedSpecializations.add(spec);
    }
  }

  isSpecializationSelected(spec: string): boolean {
    return this.selectedSpecializations.has(spec);
  }

  onSubmit(): void {

    this.error = null;
    this.successMessage = null;

    if (this.authForm.invalid) {

      this.authForm.markAllAsTouched();

      this.error =
        'Please fill out all required fields correctly.';

      return;
    }

    if (
      this.currentIntent === 'register' &&
      this.currentRole === 'therapist' &&
      this.selectedSpecializations.size === 0
    ) {

      this.error =
        'Please select at least one clinical specialization.';

      return;
    }

    this.loading = true;

    if (this.currentIntent === 'login') {
      this.handleLogin();
    } else {
      this.handleRegister();
    }
  }

  private handleLogin(): void {

    const {
      email,
      password
    } = this.authForm.value;

    const cleanEmail =
      email.trim().toLowerCase();

    console.log(
      '[AUTH] handleLogin called for:',
      cleanEmail,
      'role:',
      this.currentRole
    );

    this.authService
      .login(
        cleanEmail,
        password,
        this.currentRole
      )
      .subscribe({

        next: (response: AuthResponse) => {

          this.loading = false;

          console.log(
            '[AUTH] Login response received:',
            JSON.stringify(response)
          );

          if (response.data?.accessToken) {

            const userRole =
              this.authService.role;

            localStorage.setItem(
              'token',
              response.data.accessToken
            );

            localStorage.setItem(
              'role',
              this.currentRole
            );

            if (response.data?.user) {

              localStorage.setItem(
                'user',
                JSON.stringify(
                  response.data.user
                )
              );
            }

            console.log(
              '[AUTH] Session set by service. Token in localStorage:',
              !!localStorage.getItem('token'),
              'Role:',
              localStorage.getItem('role')
            );

            this.successMessage =
              'Login successful! Redirecting to your dashboard...';

            setTimeout(() => {

              this.ngZone.run(() => {

                console.log(
                  '[AUTH] About to navigateAfterAuth with role:',
                  userRole
                );

                this.navigateAfterAuth(
                  userRole
                );
              });

            }, 600);

          } else {

            this.error =
              'Authentication succeeded but no session token was received.';
          }
        },

        error: (err: HttpErrorResponse) => {

          this.loading = false;

          console.error(
            '[AUTH] Login error:',
            err.status,
            err.message,
            err.error
          );

          const errMsg =
            err.error?.message ||
            (
              err.status === 0
                ? 'Cannot connect to backend server on http://localhost:8000. Please ensure the backend is running.'
                : 'Login failed. Please check your credentials and try again.'
            );

          this.error = errMsg;

          if (
            errMsg.toLowerCase().includes('confirm') ||
            errMsg.toLowerCase().includes('verify')
          ) {

            this.unconfirmedEmail =
              cleanEmail;
          }
        }
      });
  }

  private handleRegister(): void {

    const {
      fullName,
      email,
      password,
      injuryType,
      bio
    } = this.authForm.value;

    const cleanEmail =
      email.trim().toLowerCase();

    const payload: any = {

      fullName:
        fullName?.trim(),

      email:
        cleanEmail,

      password,

      role:
        this.currentRole
    };

    if (this.currentRole === 'patient') {

      payload.injuryType =
        injuryType;

    } else if (
      this.currentRole === 'therapist'
    ) {

      payload.specialization =
        Array.from(
          this.selectedSpecializations
        );

      if (bio?.trim()) {
        payload.bio =
          bio.trim();
      }
    }

    this.authService
      .register(payload)
      .subscribe({

        next: () => {

          this.loading = false;

          this.router.navigate(
            ['/auth/confirm-email'],
            {
              queryParams: {
                email: cleanEmail,
                role: this.currentRole
              }
            }
          );
        },

        error: (err: HttpErrorResponse) => {

          this.loading = false;

          const msg =
            err.error?.message ||
            (
              err.status === 0
                ? 'Cannot connect to backend server on http://localhost:8000. Please ensure the backend is running.'
                : 'Registration failed. Please verify your details and try again.'
            );

          this.error = msg;

          if (
            msg.toLowerCase().includes('confirm') ||
            msg.toLowerCase().includes('verify')
          ) {

            this.unconfirmedEmail =
              cleanEmail;
          }
        }
      });
  }

  goToVerifyEmail(): void {

    if (this.unconfirmedEmail) {

      this.router.navigate(
        ['/auth/confirm-email'],
        {
          queryParams: {
            email:
              this.unconfirmedEmail,

            role:
              this.currentRole
          }
        }
      );
    }
  }

  private navigateAfterAuth(
    role?: UserRole | null
  ): void {

    const effectiveRole = (
      role ||
      this.authService.role ||
      this.currentRole
    ).toLowerCase();

    console.log(
      '[AUTH] navigateAfterAuth called. effectiveRole:',
      effectiveRole
    );

    console.log(
      '[AUTH] isAuthenticated:',
      this.authService.isAuthenticated(),
      'storedRole:',
      this.authService.role
    );

    const returnUrl =
      this.route.snapshot.queryParams[
        'returnUrl'
      ];

    if (
      returnUrl &&
      returnUrl.startsWith(
        `/${effectiveRole}`
      )
    ) {

      console.log(
        '[AUTH] Navigating to returnUrl:',
        returnUrl
      );

      this.router.navigateByUrl(
        returnUrl
      );

      return;
    }

    let targetRoute: string;

    if (effectiveRole === 'patient') {

      targetRoute =
        '/patient/patient-dashboard';

    } else if (
      effectiveRole === 'therapist'
    ) {

      targetRoute =
        '/therapist/therapist-dashboard';

    } else {

      targetRoute = '/';
    }

    console.log(
      '[AUTH] Navigating to:',
      targetRoute
    );

    this.router
      .navigate([targetRoute])
      .then(
        (success: boolean) =>
          console.log(
            '[AUTH] Navigation result:',
            success
          ),

        (err: unknown) =>
          console.error(
            '[AUTH] Navigation error:',
            err
          )
      );
  }

  // --- Google OAuth ---

  private initGoogleAuth(): void {

    if (typeof window === 'undefined') {
      return;
    }

    if (typeof google === 'undefined') {

      const existingScript =
        this.document.getElementById(
          'google-jssdk'
        );

      if (!existingScript) {

        const script =
          this.document.createElement(
            'script'
          );

        script.id =
          'google-jssdk';

        script.src =
          'https://accounts.google.com/gsi/client';

        script.async = true;
        script.defer = true;

        script.onload = () => {

          this.ngZone.run(() => {

            this.googleLoaded = true;

            this.renderGoogleButton();
          });
        };

        script.onerror = () => {

          console.warn(
            'Google Identity Services script failed to load'
          );
        };

        this.document.head.appendChild(
          script
        );

      } else {

        existingScript.addEventListener(
          'load',
          () => {

            this.ngZone.run(() => {

              this.googleLoaded = true;

              this.renderGoogleButton();
            });
          }
        );
      }

    } else {

      this.googleLoaded = true;

      this.renderGoogleButton();
    }
  }

  renderGoogleButton(): void {

    if (
      typeof google === 'undefined' ||
      !google.accounts?.id
    ) {
      return;
    }

    try {

      google.accounts.id.initialize({

        client_id:
          this.googleClientId,

        callback: (response: any) =>
          this.handleGoogleCredentialResponse(
            response
          ),

        auto_select: false,

        cancel_on_tap_outside: true
      });

      const host =
        this.googleBtnHostRef?.nativeElement ||
        document.getElementById(
          'googleBtnHost'
        );

      if (host) {

        host.innerHTML = '';

        google.accounts.id.renderButton(
          host,
          {
            theme: 'filled_black',

            size: 'large',

            type: 'standard',

            shape: 'rectangular',

            text:
              this.currentIntent === 'login'
                ? 'signin_with'
                : 'signup_with',

            logo_alignment: 'left',

            width:
              host.parentElement?.clientWidth
                ? Math.min(
                    host.parentElement.clientWidth,
                    480
                  )
                : 380
          }
        );

        this.googleLoaded = true;
      }

    } catch (err) {

      console.warn(
        'Could not render Google button:',
        err
      );
    }
  }

  triggerGoogleAuth(): void {

    this.error = null;
    this.googleLoading = true;

    if (
      typeof google === 'undefined' ||
      !google.accounts?.id
    ) {

      this.googleLoading = false;

      this.error =
        'Google Sign-In is initializing. Please wait a moment and try again.';

      this.initGoogleAuth();

      return;
    }

    try {

      const host =
        this.googleBtnHostRef?.nativeElement ||
        document.getElementById(
          'googleBtnHost'
        );

      const googleBtn =
        host?.querySelector(
          '[role="button"]'
        ) as HTMLElement | null;

      if (googleBtn) {

        this.googleLoading = false;

        googleBtn.click();

        return;
      }

      google.accounts.id.prompt(
        (notification: any) => {

          this.ngZone.run(() => {

            this.googleLoading = false;

            if (
              notification.isNotDisplayed()
            ) {

              this.error =
                'Google Sign-In popup was blocked. Please use the Google button directly or allow popups for this site.';
            }
          });
        }
      );

    } catch (e) {

      this.googleLoading = false;

      this.error =
        'Unable to launch Google Sign-In. Please check your browser popup settings.';
    }
  }

  private handleGoogleCredentialResponse(
    response: any
  ): void {

    this.ngZone.run(() => {

      this.googleLoading = true;

      if (!response?.credential) {

        this.googleLoading = false;

        this.error =
          'Google authentication was cancelled or failed to retrieve token.';

        return;
      }

      this.authService
        .googleAuth(
          response.credential,
          this.currentRole
        )
        .subscribe({

          next: (
            authRes: AuthResponse
          ) => {

            this.googleLoading = false;

            if (
              authRes.data?.accessToken
            ) {

              const userRole =
                this.authService.role;

              this.successMessage =
                'Google authentication successful! Redirecting...';

              setTimeout(() => {

                this.navigateAfterAuth(
                  userRole
                );

              }, 600);

            } else {

              this.error =
                'Google login succeeded, but no session token was received.';
            }
          },

          error: (
            err: HttpErrorResponse
          ) => {

            this.googleLoading = false;

            const msg =
              err.error?.message ||
              (
                err.status === 0
                  ? 'Backend server unreachable. Please make sure the backend is running.'
                  : 'Google authentication failed. Please try again.'
              );

            this.error = msg;
          }
        });
    });
  }
}
