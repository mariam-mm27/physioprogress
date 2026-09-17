import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../core/services/patient.service';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-patient-topbar',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './patient-topbar.css',
  templateUrl: './patient-topbar.html',
})
export class PatientTopbar implements OnInit, OnDestroy {

  patientData: AuthUser | null = null;
  patientId = '';
  showNotifications = false;
  private destroy$ = new Subject<void>();

  constructor(
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to shared user observable for real-time updates
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user) {
          this.patientData = user;
        }
      });

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchUserData(): void {
    const token = this.authService.getToken();

    if (typeof (this.authService as any).fetchMe === 'function') {
      (this.authService as any).fetchMe()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
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
      (this.authService as any).getMe(token)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
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

    this.patientService.getPatientProfile(this.patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

  get profileImageUrl(): string {
    return this.patientData?.profilePicture?.url || '/assets/default-avatar.png';
  }
}
