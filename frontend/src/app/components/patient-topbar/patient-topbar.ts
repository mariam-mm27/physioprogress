import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
    imports: [CommonModule],
    selector: 'app-patient-topbar',
    styleUrl: './patient-topbar.css',
    templateUrl: './patient-topbar.html'
})
export class PatientTopbar {
  user: AuthUser | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if(!this.user) {
       this.authService.fetchMe().subscribe({
        next: (res) => { if (res.data?.user) this.user = res.data.user; },
        error: () => {}
      });
    }
  }

  get userName(): string {
    return this.user?.fullName || 'Patient Account';
  }

  get userId(): string {
    return this.user?.patientCode || 'ID #-';
  }
}