
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../services/auth.service';

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

  selectedPlanId = '';
  sessionNotes = '';

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  activeVideoUrl: SafeResourceUrl | null = null;

  // GIF or normal video
  activeVideoType: 'gif' | 'video' | null = null;

  patientId = '';

  // Dashboard patient information
  patientName = '';
  patientCode = '';
  condition = '';

  constructor(
    private patientService: PatientService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    if (user) {
      this.patientData = user;

      this.patientId = String(
        user._id ||
        user['id'] ||
        user['patientId'] ||
        ''
      );

      this.setPatientDisplayData(user);
    }

    if (this.patientId) {

      // Get updated patient data including assigned therapist
      this.loadPatientProfile();

      this.loadExercisePlans();
      this.loadSessionLogs();

    } else {

      const token = this.authService.getToken();

      if (token) {
        this.authService.getMe(token).subscribe({

          next: (res) => {

            const userData: any =
              res.data?.user || res.data;

            if (userData) {

              this.patientData = userData;

              this.patientId = String(
                userData._id ||
                userData['id'] ||
                userData['patientId'] ||
                ''
              );

              this.setPatientDisplayData(userData);

              localStorage.setItem(
                'user',
                JSON.stringify(userData)
              );

              this.loadPatientProfile();
              this.loadExercisePlans();
              this.loadSessionLogs();
            }
          },

          error: (error) => {
            console.error(
              'Error loading current user:',
              error
            );
          }

        });
      }
    }
  }

  private setPatientDisplayData(user: any): void {

    if (!user) return;

    this.patientName =
      user.fullName ||
      user.name ||
      '';

    this.patientCode =
      user.patientCode ||
      user.code ||
      user.patientId ||
      user._id ||
      user.id ||
      '';

    this.condition =
      user.injuryType ||
      user.condition ||
      '';
  }

  // Check if the patient already has a therapist
  get hasTherapist(): boolean {
    return !!this.patientData?.assignedTherapist;
  }

  loadPatientProfile(): void {

    if (!this.patientId) return;

    this.patientService
      .getPatientProfile(this.patientId)
      .subscribe({

        next: (response) => {

          console.log(
            'ASSIGNED THERAPIST:',
            response.data?.assignedTherapist
          );

          this.patientData = {
            ...this.patientData,
            ...response.data
          };

          this.setPatientDisplayData(
            this.patientData
          );

          localStorage.setItem(
            'user',
            JSON.stringify(this.patientData)
          );

          // Update therapist card immediately
          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading patient profile:',
            error
          );
        }

      });
  }

  loadExercisePlans(): void {

    if (!this.patientId) return;

    this.patientService
      .getPatientPlans(this.patientId)
      .subscribe({

        next: (response) => {

          console.log(
            'VIDEO URL:',
            response.exercisePlans[0]?.videoUrl
          );

          this.exercisePlans =
            response.exercisePlans;

          this.isLoading = false;

          if (this.exercisePlans.length > 0) {

            const firstPlan =
              this.exercisePlans[0];

            this.selectedPlanId =
              firstPlan._id;
          }

          this.calculateDashboardStats();

          // Force Angular to update the UI
          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            'Failed to load exercise plans.';

          this.isLoading = false;

          this.cdr.detectChanges();
        }

      });
  }

  loadSessionLogs(): void {

    if (!this.patientId) return;

    this.patientService
      .getPatientSessionLogs(this.patientId)
      .subscribe({

        next: (response) => {

          this.sessionLogs =
            response.data;

          this.calculateDashboardStats();

          // Force Angular to update the UI
          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading session logs:',
            error
          );
        }

      });
  }

  calculateDashboardStats(): void {

    this.completedSessions =
      this.sessionLogs.filter(
        log => log.completed
      ).length;

    this.scheduledSessions =
      this.exercisePlans.reduce(
        (total, plan) =>
          total + plan.frequencyPerWeek,
        0
      );

    if (this.scheduledSessions > 0) {

      this.adherence = Math.min(
        100,
        Math.round(
          (this.completedSessions /
            this.scheduledSessions) *
          100
        )
      );

    } else {

      this.adherence = 0;
    }

    if (this.sessionLogs.length > 0) {

      const totalPain =
        this.sessionLogs.reduce(
          (total, log) =>
            total + log.painLevel,
          0
        );

      this.averagePain = Number(
        (
          totalPain /
          this.sessionLogs.length
        ).toFixed(1)
      );

    } else {

      this.averagePain = 0;
    }
  }

  get painStatus(): {
    class: string;
    icon: string;
    text: string;
  } {

    if (this.painLevel <= 3) {

      return {
        class: 'pain-mild',
        icon: 'bi bi-emoji-smile',
        text: 'Mild pain level'
      };
    }

    if (this.painLevel <= 6) {

      return {
        class: 'pain-moderate',
        icon: 'bi bi-emoji-neutral',
        text: 'Moderate pain level'
      };
    }

    return {
      class: 'pain-severe',
      icon: 'bi bi-emoji-frown',
      text: 'Severe pain level'
    };
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

    this.patientService
      .logSession(payload)
      .subscribe({

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

          console.error(
            'Error logging session:',
            err
          );

          this.isSubmitting = false;

          this.submitError =
            'Failed to transmit session telemetry.';
        }

      });
  }

  openVideoModal(url: string): void {

    // Save the type using the original string URL
    this.activeVideoType =
      url.toLowerCase().includes('.gif')
        ? 'gif'
        : 'video';

    // Sanitize URL for Angular
    this.activeVideoUrl =
      this.sanitizer
        .bypassSecurityTrustResourceUrl(url);
  }

  getVideoThumbnail(videoUrl: string): string {

    if (!videoUrl) {
      return '';
    }

    // ExerciseDB GIF
    if (videoUrl.endsWith('.gif')) {
      return videoUrl;
    }

    // Cloudinary video
    if (videoUrl.includes('cloudinary.com')) {
      return videoUrl
        .replace(
          '/video/upload/',
          '/video/upload/so_0/'
        )
        .replace(
          /\.(mp4|mov|avi|mkv)$/i,
          '.jpg'
        );
    }

    return '';
  }

  closeVideoModal(): void {

    this.activeVideoUrl = null;
    this.activeVideoType = null;
  }
}
