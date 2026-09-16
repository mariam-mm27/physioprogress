import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { PageSectionComponent } from '../../shared/components/page-section/page-section.component';
import { AuthService, AuthResponse } from '../../services/auth.service';

@Component({
    selector: 'app-email-confirmation',
    imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent, PageSectionComponent],
    template: `
    <div class="confirmation-root bg-dark-primary min-vh-100 d-flex flex-column justify-content-between">
      <app-navbar></app-navbar>

      <main class="confirmation-main-wrapper flex-grow-1">
        <app-page-section sectionId="confirmation-section">
          <div class="confirmation-wrapper">
            <div class="confirmation-card">
              
              <!-- Header -->
              <div class="confirmation-header">
                <div class="badge-pill">
                  <span class="material-symbols-outlined badge-icon">mark_email_read</span>
                  <span class="badge-text">Account Security</span>
                </div>
                <h1 class="confirmation-title">Verify Your <span class="text-gradient">Email</span></h1>
                <p class="confirmation-subtitle">
                  We sent a 6-digit verification code to
                  <strong class="email-highlight" *ngIf="email">{{ email }}</strong>
                  <span *ngIf="!email">your registered email address</span>.
                </p>
              </div>

              <!-- Alerts -->
              <div class="error-banner" *ngIf="error">
                <span class="material-symbols-outlined">error_outline</span>
                <span>{{ error }}</span>
              </div>

              <!-- Form -->
              <form [formGroup]="confirmationForm" (ngSubmit)="onSubmit()" class="confirmation-form" novalidate>
                <div class="form-field">
                  <label class="form-label">One-Time Password (OTP)</label>
                  <div class="input-container">
                    <span class="material-symbols-outlined input-icon">pin</span>
                    <input
                      type="text"
                      formControlName="otp"
                      placeholder="• • • • • •"
                      class="form-input otp-input"
                      [class.field-error]="isFieldInvalid('otp')"
                      maxlength="6"
                      autocomplete="one-time-code"
                    />
                  </div>
                  <span class="form-error-text" *ngIf="isFieldInvalid('otp')">
                    Please enter the 6-digit numeric OTP code.
                  </span>
                </div>

                <button type="submit" class="btn-primary" [disabled]="loading">
                  <span *ngIf="!loading" class="btn-content">
                    <span>Verify Account</span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </span>
                  <span *ngIf="loading" class="btn-content">
                    <span class="material-symbols-outlined loading-spinner">progress_activity</span>
                    <span>Verifying code...</span>
                  </span>
                </button>
              </form>

              <!-- Footer Resend & Switch -->
              <div class="confirmation-footer">
                <p class="footer-text">
                  Didn't receive the OTP?
                  <button type="button" class="link-btn" (click)="resendOTP()">
                    Resend Code
                  </button>
                </p>
                <button type="button" class="back-link" (click)="goToAuth()">
                  <span class="material-symbols-outlined">arrow_back</span>
                  <span>Back to Sign In</span>
                </button>
              </div>

            </div>
          </div>
        </app-page-section>
      </main>

      <app-footer></app-footer>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      background-color: #09090b;
      color: #f4f4f5;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    }

    .confirmation-root {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #09090b;
    }

    .confirmation-main-wrapper {
      padding: 3rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .confirmation-wrapper {
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
    }

    .confirmation-card {
      background-color: #121215;
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: 1rem;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .confirmation-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1.1rem;
      border-radius: 50px;
      background-color: rgba(124, 58, 237, 0.1);
      border: 1px solid rgba(124, 58, 237, 0.3);
      width: fit-content;
    }

    .badge-icon {
      color: #a855f7;
      font-size: 1rem;
    }

    .badge-text {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a855f7;
    }

    .confirmation-title {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #f4f4f5;
      margin: 0;
    }

    .text-gradient {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .confirmation-subtitle {
      font-size: 0.9rem;
      color: #a1a1a6;
      line-height: 1.5;
      margin: 0;
    }

    .email-highlight {
      color: #f4f4f5;
      font-weight: 600;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      background-color: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.35);
      border-radius: 0.5rem;
      color: #fca5a5;
      font-size: 0.85rem;
    }

    .success-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      background-color: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.35);
      border-radius: 0.5rem;
      color: #86efac;
      font-size: 0.85rem;
    }

    .confirmation-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #f4f4f5;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      font-size: 1.15rem;
      color: #71717a;
      pointer-events: none;
    }

    .form-input {
      width: 100%;
      padding: 0.85rem 1rem 0.85rem 2.75rem;
      background-color: #18181b;
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: 0.5rem;
      color: #f4f4f5;
      font-size: 1.1rem;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      letter-spacing: 0.2em;
      text-align: center;
      transition: all 0.25s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #7c3aed;
      background-color: #18181b;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.25);
    }

    .form-input.field-error {
      border-color: #ef4444;
    }

    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0px 1000px #1e293b inset !important;
      -webkit-text-fill-color: #ffffff !important;
    }

    .form-error-text {
      font-size: 0.775rem;
      color: #f87171;
    }

    .btn-primary {
      background-color: #7c3aed;
      color: #ffffff;
      font-weight: 700;
      font-size: 1rem;
      padding: 0.95rem 1.75rem;
      border-radius: 0.5rem;
      border: none;
      box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
      transition: all 0.3s ease;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      font-family: inherit;
    }

    .btn-primary .btn-content {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #6d28d9;
      box-shadow: 0 0 30px rgba(124, 58, 237, 0.6);
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .loading-spinner {
      animation: spin 1s linear infinite;
      font-size: 1.15rem;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .confirmation-footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.85rem;
      padding-top: 1rem;
      border-top: 1px solid #27272a;
    }

    .footer-text {
      font-size: 0.85rem;
      color: #a1a1a6;
      margin: 0;
    }

    .link-btn {
      background: none;
      border: none;
      color: #a855f7;
      cursor: pointer;
      font-weight: 700;
      font-family: inherit;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .link-btn:hover {
      color: #c084fc;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: none;
      border: none;
      color: #71717a;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: inherit;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: #f4f4f5;
    }

    .back-link .material-symbols-outlined {
      font-size: 1rem;
    }
  `]
})
export class EmailConfirmationComponent implements OnInit {
  confirmationForm!: FormGroup;
  loading = false;
  error: string | null = null;
  email: string = '';
  role: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.role = this.route.snapshot.queryParamMap.get('role') || '';
    this.initializeForm();
  }

  initializeForm(): void {
    this.confirmationForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.confirmationForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    this.error = null;

    if (this.confirmationForm.invalid) {
      this.confirmationForm.markAllAsTouched();
      this.error = 'Please enter a valid 6-digit OTP code.';
      return;
    }

    if (!this.email) {
      this.error = 'No email specified. Please start registration again.';
      return;
    }

    this.loading = true;
    const { otp } = this.confirmationForm.value;

    this.authService.confirmEmail(this.email, otp).subscribe({
      next: (response: AuthResponse) => {
        this.loading = false;
        const effectiveRole = this.authService.role?.toLowerCase() || 'patient';

        // Redirect immediately to dashboard - no delay
        if (effectiveRole === 'therapist') {
          this.router.navigate(['/therapist/therapist-dashboard']).catch(() => {
            this.router.navigate(['/therapist']);
          });
        } else {
          this.router.navigate(['/patient/patient-dashboard']).catch(() => {
            this.router.navigate(['/patient']);
          });
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Verification failed. Please verify the code and try again.';
      }
    });
  }

  resendOTP(): void {
    if (!this.email) {
      this.error = 'No email found. Please go back and register again.';
      return;
    }
    this.error = null;

    // resend OTP
    this.authService.resendOTP(this.email).subscribe({
      next: () => {
        this.error = null;
        // Could add a temporary success message here if needed
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Could not resend OTP. Please try again.';
      }
    });
  }

  goToAuth(): void {
    this.router.navigate(['/auth'], { queryParams: { mode: 'login' } });
  }
}

