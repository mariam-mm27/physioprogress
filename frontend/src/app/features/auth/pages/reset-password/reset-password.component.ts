import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { PageSectionComponent } from '../../../../shared/components/page-section/page-section.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
    PageSectionComponent
  ],
  template: `
    <div class="reset-root bg-dark-primary min-vh-100 d-flex flex-column justify-content-between">
      <app-navbar></app-navbar>

      <main class="reset-main flex-grow-1">
        <app-page-section sectionId="reset-section">
          <div class="reset-wrapper">
            <div class="reset-card">

              <!-- Header -->
              <div class="reset-header">
                <div class="badge-pill">
                  <span class="material-symbols-outlined badge-icon">password</span>
                  <span class="badge-text">Secure Credentials</span>
                </div>
                <h1 class="reset-title">Create New <span class="text-gradient">Password</span></h1>
                <p class="reset-subtitle">
                  Choose a new strong password for your PhysioProgress account.
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

              <!-- Form -->
              <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="reset-form" novalidate>
                
                <!-- New Password -->
                <div class="form-field">
                  <label class="form-label">New Password</label>
                  <div class="input-container">
                    <span class="material-symbols-outlined input-icon">lock</span>
                    <input
                      type="password"
                      formControlName="password"
                      class="form-input"
                      [class.field-error]="isFieldInvalid('password')"
                      placeholder="••••••••••••"
                      autocomplete="new-password"
                    />
                  </div>
                  <p class="form-hint">
                    Minimum 6 characters with at least one special character (!&#64;#$%^&*)
                  </p>
                  <span class="form-error-text" *ngIf="isFieldInvalid('password')">
                    {{ getPasswordError() }}
                  </span>
                </div>

                <!-- Confirm New Password -->
                <div class="form-field">
                  <label class="form-label">Confirm New Password</label>
                  <div class="input-container">
                    <span class="material-symbols-outlined input-icon">lock_clock</span>
                    <input
                      type="password"
                      formControlName="confirmPassword"
                      class="form-input"
                      [class.field-error]="isFieldInvalid('confirmPassword') || (resetForm.hasError('mismatch') && resetForm.get('confirmPassword')?.touched)"
                      placeholder="••••••••••••"
                      autocomplete="new-password"
                    />
                  </div>
                  <span class="form-error-text" *ngIf="resetForm.hasError('mismatch') && resetForm.get('confirmPassword')?.touched">
                    Passwords do not match.
                  </span>
                </div>

                <button type="submit" class="btn-primary" [disabled]="loading">
                  <span *ngIf="!loading" class="btn-content">
                    <span>Reset Password</span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </span>
                  <span *ngIf="loading" class="btn-content">
                    <span class="material-symbols-outlined loading-spinner">progress_activity</span>
                    <span>Updating password...</span>
                  </span>
                </button>
              </form>

              <!-- Footer navigation -->
              <div class="reset-footer">
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

    .reset-root {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #09090b;
    }

    .reset-main {
      padding: 3rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reset-wrapper {
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
    }

    .reset-card {
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

    .reset-header {
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

    .reset-title {
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

    .reset-subtitle {
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

    .reset-form {
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

    .form-hint {
      font-size: 0.75rem;
      color: #71717a;
      margin: 0;
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

    .reset-footer {
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
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.error = 'Invalid or missing password reset token. Please request a new link.';
    }

    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator()]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordValidator() {
    return (control: AbstractControl) => {
      if (!control.value) return null;
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
      return hasSpecialChar ? null : { noSpecialChar: true };
    };
  }

  private passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.resetForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getPasswordError(): string {
    const control = this.resetForm.get('password');
    if (!control?.errors || !(control.dirty || control.touched)) return '';
    if (control.errors['required']) return 'Password is required.';
    if (control.errors['minlength']) return 'Password must be at least 6 characters.';
    if (control.errors['noSpecialChar']) return 'Password must contain at least one special character (!@#$%^&*).';
    return '';
  }

  onSubmit(): void {
    this.error = null;
    this.successMessage = null;

    if (!this.token) {
      this.error = 'Missing reset token. Please request a new link.';
      return;
    }

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.error = 'Please fill out all fields correctly.';
      return;
    }

    this.loading = true;
    const { password } = this.resetForm.value;

    this.authService.resetPassword(this.token, password).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.successMessage = response.message || 'Password has been reset successfully! Redirecting to Sign In...';
        setTimeout(() => {
          this.router.navigate(['/auth'], { queryParams: { mode: 'login' } });
        }, 1500);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Password reset failed. The link may have expired.';
      }
    });
  }
}
