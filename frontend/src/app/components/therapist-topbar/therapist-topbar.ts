import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    imports: [CommonModule],
    selector: 'app-therapist-topbar',
    styleUrl: './therapist-topbar.css',
    templateUrl: './therapist-topbar.html'
})
export class TherapistTopbar implements OnInit, OnDestroy {
  user: AuthUser | null = null;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to user changes via the shared observable
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user) {
          this.user = user;
        }
      });

    // If no user in the subject, fetch from storage or API
    this.user = this.authService.getUser();
    if (!this.user) {
      this.authService.fetchMe()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.data?.user) {
              this.user = res.data.user;
            }
          },
          error: () => {}
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get userName(): string {
    return this.user?.fullName || 'Therapist Account';
  }

  get userId(): string {
    return this.user?.therapistCode || 'ID #-';
  }

  get profileImageUrl(): string {
    return this.user?.profilePicture?.url || '/assets/default-avatar.png';
  }
}
