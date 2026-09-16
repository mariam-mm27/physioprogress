import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, AuthUser } from '../../../services/auth.service';

@Component({
    selector: 'app-patient-dashboard',
    imports: [CommonModule, RouterModule],
    styleUrl: './patient-dashboard.css',
    templateUrl: './patient-dashboard.html'
})
export class PatientDashboard implements OnInit {
  user: AuthUser | null = null;
  loadingUser = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (!this.user?.fullName) {
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

  get patientName(): string {
    return this.user?.fullName || 'Patient';
  }

  get patientCode(): string {
    return this.user?.patientCode || this.authService.patientCode || 'PAT-ACTIVE';
  }

  get condition(): string {
    return this.user?.injuryType || 'Physical Therapy Protocol';
  }
}
