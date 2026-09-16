import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../core/services/patient.service';

@Component({
  selector: 'app-patient-topbar',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './patient-topbar.css',
  templateUrl: './patient-topbar.html',
})
export class PatientTopbar implements OnInit {

  patientData: any = null;

  patientId = '6aa5e5b0b6e2faca60e9b8b6';

  showNotifications = false;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatientProfile();
  }

  loadPatientProfile(): void {
    this.patientService.getPatientProfile(this.patientId).subscribe({
      next: (response) => {
        this.patientData = response.data;
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

