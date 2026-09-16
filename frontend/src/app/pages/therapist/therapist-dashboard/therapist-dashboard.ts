import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, AuthUser } from '../../../services/auth.service';

@Component({
    selector: 'app-therapist-dashboard',
    imports: [CommonModule, RouterModule],
    styleUrl: './therapist-dashboard.css',
    templateUrl: './therapist-dashboard.html'
})
export class TherapistDashboard implements OnInit {
  user: AuthUser | null = null;
  copied = false;
  loadingUser = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (!this.user?.therapistCode) {
      this.refreshUserData();
    }
  }

  refreshUserData(): void {
    this.loadingUser = true;
    this.authService.fetchMe().subscribe({
      next: (res) => {
        this.loadingUser = false;
        if (res.data?.user) {
          this.user = res.data.user;
        }
      },
      error: () => {
        this.loadingUser = false;
      }
    });
  }

  get therapistCode(): string {
    return this.user?.therapistCode || this.authService.therapistCode || 'THR-PENDING';
  }

  get therapistName(): string {
    return this.user?.fullName || 'Doctor / Physical Therapist';
  }

  get specializations(): string[] {
    return this.user?.specialization || ['Orthopedic PT', 'Sports Rehabilitation'];
  }

  copyCode(): void {
    if (!this.therapistCode || this.therapistCode === 'THR-PENDING') return;

    navigator.clipboard.writeText(this.therapistCode).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2500);
    }).catch(() => {
      // Fallback
      this.copied = true;
      setTimeout(() => (this.copied = false), 2500);
    });
  }
}
