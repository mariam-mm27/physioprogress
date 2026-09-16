import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-login-page',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class LoginPage implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.auth.role) {
      this.router.navigate(this.auth.role === 'patient' ? ['/patient'] : ['/therapist/therapist-dashboard']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.error = '';
    this.loading = true;
    const { email, password } = this.form.value;

    this.auth
      .login(email, password)
      .pipe(switchMap(() => this.auth.fetchMe()))
      .subscribe({
        next: (res) => {
          this.loading = false;
          const role = res.data?.user?.role || this.auth.role;
          this.router.navigate(role === 'patient' ? ['/patient/patient-dashboard'] : ['/therapist/therapist-dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message ?? 'Login failed. Check your credentials.';
        },
      });
  }
}