import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../core/services/patient.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient-topbar',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './patient-topbar.css',
  templateUrl: './patient-topbar.html',
})
export class PatientTopbar implements OnInit {

  patientData: any = null;
  patientId = '';
  showNotifications = false;

  constructor(
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user: any = this.authService.getUser();

    if (user) {
      this.patientData = user;
      this.patientId = user._id || user.id || '';
    }

    if (this.patientId) {
      this.loadPatientProfile();
    } else {
      this.fetchUserData();
    }
  }

  fetchUserData(): void {
    const token = this.authService.getToken();

    if (typeof (this.authService as any).fetchMe === 'function') {
      (this.authService as any).fetchMe().subscribe({
        next: (res: any) => {
          const userData = res.data?.user || res.data;

          if (userData) {
            this.handleUserLoaded(userData);
          }
        }
      });
    } else if (
      token &&
      typeof (this.authService as any).getMe === 'function'
    ) {
      (this.authService as any).getMe(token).subscribe({
        next: (res: any) => {
          const userData = res.data?.user || res.data;

          if (userData) {
            this.handleUserLoaded(userData);
          }
        }
      });
    }
  }

  private handleUserLoaded(userData: any): void {
    this.patientData = userData;
    this.patientId = userData._id || userData.id || '';

    localStorage.setItem('user', JSON.stringify(userData));

    if (this.patientId) {
      this.loadPatientProfile();
    }
  }

  loadPatientProfile(): void {
    if (!this.patientId) return;

    this.patientService.getPatientProfile(this.patientId).subscribe({
      next: (response) => {
        this.patientData = {
          ...this.patientData,
          ...response.data
        };
      },
      error: (error) => {
        console.error('Error loading patient profile:', error);
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  get userName(): string {
    return this.patientData?.fullName || 'Patient Account';
  }

  get userId(): string {
    return this.patientData?.patientCode ||
           this.patientData?._id ||
           'ID #-';
  }
}