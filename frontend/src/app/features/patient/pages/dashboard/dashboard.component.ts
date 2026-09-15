import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PatientService } from '../../../../core/services/patient.service';
import {
  ExercisePlan,
  SessionLogPayload
} from '../../../../core/models/patient-dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  exercisePlans: ExercisePlan[] = [];

  isLoading = true;
  errorMessage = '';

  // Log Session
  showLogForm = false;
  selectedPlanId = '';
  painLevel = 1;
  notes = '';
  isSubmitting = false;
  successMessage = '';

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.fetchPatientPlans();
  }

  fetchPatientPlans(): void {
    const patientId = '6aa5e5b0b6e2faca60e9b8b6';

    this.patientService.getPatientPlans(patientId).subscribe({
      next: (response) => {
        this.exercisePlans = response.exercisePlans;
        this.isLoading = false;

        if (this.exercisePlans.length > 0) {
          this.selectedPlanId = this.exercisePlans[0]._id;
        }
      },

      error: (err) => {
        console.error(err);
        this.errorMessage = 'فشل في تحميل التمارين';
        this.isLoading = false;
      }
    });
  }

  openVideo(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  openLogForm(): void {
    this.showLogForm = true;
    this.successMessage = '';

    if (this.exercisePlans.length > 0 && !this.selectedPlanId) {
      this.selectedPlanId = this.exercisePlans[0]._id;
    }
  }

  closeLogForm(): void {
    this.showLogForm = false;
    this.notes = '';
    this.painLevel = 1;
    this.successMessage = '';
  }

  submitSession(): void {

    if (!this.selectedPlanId) {
      return;
    }

    const payload: SessionLogPayload = {
      planId: this.selectedPlanId,
      completed: true,
      painLevel: this.painLevel,
      notes: this.notes || undefined
    };

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.patientService.logSession(payload).subscribe({

      next: () => {

        this.isSubmitting = false;
        this.successMessage = 'Session logged successfully!';

        this.notes = '';
        this.painLevel = 1;

        setTimeout(() => {
          this.showLogForm = false;
          this.successMessage = '';
        }, 1500);
      },

      error: (err) => {

        console.error(err);

        this.isSubmitting = false;
        this.errorMessage = 'Failed to log session.';
      }
    });
  }

  showNotifications(): void {
    alert('You have no new notifications.');
  }
}