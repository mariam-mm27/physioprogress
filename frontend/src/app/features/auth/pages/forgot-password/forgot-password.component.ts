import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { PageSectionComponent } from '../../../../shared/components/page-section/page-section.component';
import { AuthService, AuthResponse } from '../../../../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        NavbarComponent,
        FooterComponent,
        PageSectionComponent
    ],
    template: `
    <div class="forgot-root bg-dark-primary min-vh-100 d-flex flex-column justify-content-between">
      <app-navbar></app-navbar>

      <main class="forgot-main flex-grow-1">
        <app-page-section sectionId="forgot-section">
          <div class="forgot-wrapper">
            <div class="forgot-card">

              <!-- Header -->
              <div class="forgot-header">
                <div class="badge-pill">
                  <span class="material-symbols-outlined badge-icon">lock_reset</span>
                  <span class="badge-text">Account Recovery</span>
                </div>
                <h1 class="forgot-title">Reset Your <span class="text-gradient">Password</span></h1>
                <p class="forgot-subtitle">
                  Enter your registered email address and we will generate a secure password reset link for your account.
                </p>
              </div>

              <!-- Alerts -->
              <div class="error-banner" *ngIf="error">
                <span class="material-symbols-outlined">error_outline</span>
                <span>{{ error }}</span>
              </div>

              <div class="success-banner" *ngIf="successMessage">
                <span class="material-symbols-outlined">check_circle</span>
                <span>{{ successMessage }}</span>
              </div>

              <div class="quick-link-box" *ngIf="generatedResetLink">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <span class="material-symbols-outlined link-box-icon">vpn_key</span>
                  <span class="fw-bold" style="color: #a855f7; font-size: 0.85rem;">Password Reset Link:</span>
                </div>
                <a [href]="generatedResetLink" class="direct-reset-btn">
                  <span>Open Password Reset Page</span>
                  <span class="material-symbols-outlined">arrow_forward</span>
                </a>
              </div>

              <!-- Form -->
              <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="forgot-form" novalidate>
                <div class="form-field">
                  <label class="form-label">Email Address</label>
                  <div class="input-container">
                    <span class="material-symbols-outlined input-icon">mail</span>
                    <input
                      type="email"
                      formControlName="email"
                      class="form-input"
                      [class.field-error]="isFieldInvalid('email')"
                      placeholder="name&#64;example.com"
                      autocomplete="email"
                    />
                  </div>
                  <span class="form-error-text" *ngIf="isFieldInvalid('email')">
                    Please provide a valid registered email address.
                  </span>
                </div>

                <button type="submit" class="btn-primary" [disabled]="loading">
                  <span *ngIf="!loading" class="btn-content">
                    <span>Send Reset Link</span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </span>
                  <span *ngIf="loading" class="btn-content">
                    <span class="material-symbols-outlined loading-spinner">progress_activity</span>
                    <span>Generating reset link...</span>
                  </span>
                </button>
              </form>

              <!-- Footer navigation -->
              <div class="forgot-footer">
                <a routerLink="/auth" [queryParams]="{ mode: 'login' }" class="back-link">
                  <span class="material-symbols-outlined">arrow_back</span>
                  <span>Back to Sign In</span>
                </a>
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

    .forgot-root {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #09090b;
    }

    .forgot-main {
      padding: 3rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .forgot-wrapper {
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
    }

    .forgot-card {
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

    .forgot-header {
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

    .forgot-title {
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

    .forgot-subtitle {
      font-size: 0.9rem;
      color: #a1a1a6;
      line-height: 1.5;
      margin: 0;
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

    .quick-link-box {
      background-color: rgba(124, 58, 237, 0.08);
      border: 1px dashed rgba(124, 58, 237, 0.4);
      border-radius: 0.5rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .link-box-icon {
      color: #a855f7;
      font-size: 1.15rem;
    }

    .direct-reset-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background-color: #7c3aed;
      color: #ffffff;
      padding: 0.65rem 1rem;
      border-radius: 0.375rem;
      font-weight: 600;
      font-size: 0.85rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .direct-reset-btn:hover {
      background-color: #6d28d9;
      box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
    }

    .forgot-form {
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
      font-size: 0.9rem;
      font-family: inherit;
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

    .forgot-footer {
      display: flex;
      justify-content: center;
      padding-top: 1rem;
      border-top: 1px solid #27272a;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: #a1a1a6;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: #a855f7;
    }

    .back-link .material-symbols-outlined {
      font-size: 1.1rem;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  generatedResetLink: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.forgotForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    this.error = null;
    this.successMessage = null;
    this.generatedResetLink = null;

    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      this.error = 'Please enter a valid email address.';
      return;
    }

    this.loading = true;
    const { email } = this.forgotForm.value;

    this.authService.forgetPassword(email.trim().toLowerCase()).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.successMessage = response.message || 'Password reset link sent to your email.';
        if (response.data?.resetLink) {
          this.generatedResetLink = response.data.resetLink;
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || (err.status === 0 ? 'Backend server unreachable.' : 'Failed to request password reset. Please verify your email.');
      }
    });
  }
}
