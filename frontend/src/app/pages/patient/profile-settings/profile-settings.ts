import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../../../services/auth.service';

@Component({
    selector: 'app-patient-profile-settings',
    imports: [CommonModule],
    styleUrl: './profile-settings.css',
    templateUrl: './profile-settings.html'
})
export class PatientProfileSettings implements OnInit {
  user: AuthUser | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (!this.user?.fullName) {
      this.authService.fetchMe().subscribe({
        next: (res) => {
          if (res.data?.user) {
            this.user = res.data.user;
          }
        }
      });
    }
  }

  get patientCode(): string {
    return this.user?.patientCode || this.authService.patientCode || 'PAT-ACTIVE';
  }
}