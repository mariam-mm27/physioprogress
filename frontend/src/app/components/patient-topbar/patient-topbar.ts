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
    const user = this.authService.getUser();
    if (user) {
      this.patientData = user;
      this.patientId = user._id || user.id || '';
    }

    if (this.patientId) {
      this.loadPatientProfile();
    } else {
      const token = this.authService.getToken();
      if (token) {
        this.authService.getMe(token).subscribe({
          next: (res) => {
            const userData: any = res.data?.user || res.data;
            if (userData) {
              this.patientData = userData;
              this.patientId = userData._id || userData.id || '';
              localStorage.setItem('user', JSON.stringify(userData));
            }
          }
        });
      }
    }
  }

  loadPatientProfile(): void {
    if (!this.patientId) return;
    this.patientService.getPatientProfile(this.patientId).subscribe({
      next: (response) => {
        this.patientData = { ...this.patientData, ...response.data };
      },
      error: (error) => {
        console.error('Error loading patient profile:', error);
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }
}

