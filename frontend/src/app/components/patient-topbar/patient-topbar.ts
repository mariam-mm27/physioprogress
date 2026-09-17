
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

  showNotifications = false;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user: any = this.authService.getUser();

    if (user) {
      this.patientData = user;
    } else {
      this.fetchUserData();
    }
  }

  private fetchUserData(): void {
    this.authService.fetchMe().subscribe({
      next: (res: any) => {
        const userData =
          res.data?.user || res.data;

        if (userData) {
          this.patientData = userData;

          localStorage.setItem(
            'user',
            JSON.stringify(userData)
          );
        }
      },

      error: (error) => {
        console.error(
          'Error loading patient data:',
          error
        );
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications =
      !this.showNotifications;
  }
}
