import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PatientService } from '../../../core/services/patient.service';
import {
  ExercisePlan,
  SessionLogPayload
} from '../../../core/models/patient-dashboard';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-dashboard.html',
  styleUrl: './patient-dashboard.css'
})
export class PatientDashboard implements OnInit {

  exercisePlans: ExercisePlan[] = [];
  patientData: any = null;

  isLoading = true;
  errorMessage = '';

  sessionLogs: any[] = [];

  adherence = 0;
  averagePain = 0;
  completedSessions = 0;
  scheduledSessions = 0;


  painLevel: number = 3;

  get painStatus() {
    if (this.painLevel <= 3) {
      return {
        text: 'Mild Discomfort (Safe for progression)',
        icon: 'bi-emoji-smile',
        class: 'pain-mild'
      };
    } else if (this.painLevel <= 6) {
      return {
        text: 'Moderate Pain (Maintain steady control)',
        icon: 'bi-emoji-neutral',
        class: 'pain-moderate'
      };
    } else {
      return {
        text: 'Severe Threshold (Caution: notify Dr. Vance)',
        icon: 'bi-emoji-frown',
        class: 'pain-severe'
      };
    }
  }

  selectedPlanId = '';

  sessionNotes = '';

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  activeVideoUrl: string | null = null;

  patientId = '6aa5e5b0b6e2faca60e9b8b6';

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatientProfile();
    this.loadExercisePlans();
    this.loadSessionLogs();
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

  loadExercisePlans(): void {
    this.patientService.getPatientPlans(this.patientId).subscribe({
      next: (response) => {
        this.exercisePlans = response.exercisePlans;
        this.isLoading = false;

        if (this.exercisePlans.length > 0) {
          const firstPlan = this.exercisePlans[0];
          this.selectedPlanId = firstPlan._id;
        }

        this.calculateDashboardStats();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load exercise plans.';
        this.isLoading = false;
      }
    });
  }

  loadSessionLogs(): void {
    this.patientService.getPatientSessionLogs(this.patientId).subscribe({
      next: (response) => {
        this.sessionLogs = response.data;
        this.calculateDashboardStats();
      },
      error: (error) => {
        console.error('Error loading session logs:', error);
      }
    });
  }

  calculateDashboardStats(): void {
    this.completedSessions = this.sessionLogs.filter(
      log => log.completed
    ).length;

    this.scheduledSessions = this.exercisePlans.reduce(
      (total, plan) => total + plan.frequencyPerWeek,
      0
    );

    if (this.scheduledSessions > 0) {
      this.adherence = Math.min(
        100,
        Math.round(
          (this.completedSessions / this.scheduledSessions) * 100
        )
      );
    } else {
      this.adherence = 0;
    }

    if (this.sessionLogs.length > 0) {
      const totalPain = this.sessionLogs.reduce(
        (total, log) => total + log.painLevel,
        0
      );

      this.averagePain = Number(
        (totalPain / this.sessionLogs.length).toFixed(1)
      );
    } else {
      this.averagePain = 0;
    }
  }

  submitLog(): void {
    if (!this.selectedPlanId) return;

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    const payload: SessionLogPayload = {
      planId: this.selectedPlanId,
      completed: true,
      painLevel: Number(this.painLevel),
      notes: this.sessionNotes
    };

    this.patientService.logSession(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.sessionNotes = '';

        this.loadSessionLogs();

        setTimeout(() => {
          this.submitSuccess = false;
        }, 3500);
      },
      error: (err) => {
        console.error('Error logging session:', err);
        this.isSubmitting = false;
        this.submitError = 'Failed to transmit session telemetry.';
      }
    });
  }

  openVideoModal(url: string): void {
    this.activeVideoUrl = url;
  }

  closeVideoModal(): void {
    this.activeVideoUrl = null;
  }
}