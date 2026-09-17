import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient-topbar',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './patient-topbar.css',
  templateUrl: './patient-topbar.html'
})
export class PatientTopbar implements OnInit {

  patientData: any = null;
  patientId = '';
  showNotifications = false;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user: any = this.authService.getUser();

    if (user) {
      this.patientData = user;
      this.patientId = user._id || user.id || '';
    } else {
      this.fetchUserData();
    }
  }

  private fetchUserData(): void {
    if (typeof (this.authService as any).fetchMe === 'function') {
      (this.authService as any).fetchMe().subscribe({
        next: (res: any) => {
          const userData = res.data?.user || res.data;

          if (userData) {
            this.handleUserLoaded(userData);
          }
        },
        error:(error : any) => {
          console.error('Error loading patient data:', error);
        }
      });
    }
  }

  private handleUserLoaded(userData: any): void {
    this.patientData = userData;
    this.patientId = userData._id || userData.id || '';

    localStorage.setItem('user', JSON.stringify(userData));
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  get userName(): string {
    return this.patientData?.fullName || this.patientData?.name || 'Patient Account';
  }

  get userId(): string {
    return this.patientData?.patientCode ||
           this.patientData?._id ||
           'ID #-';
  }
}