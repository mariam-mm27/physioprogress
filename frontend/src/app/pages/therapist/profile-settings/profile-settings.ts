import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, AuthUser } from '../../../services/auth.service';

@Component({
    selector: 'app-profile-settings',
    imports: [CommonModule, FormsModule],
    styleUrl: './profile-settings.css',
    templateUrl: './profile-settings.html'
})
export class ProfileSettings implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();

  user: AuthUser | null = null;
  copied = false;
  isEditing = false;
  isSaving = false;
  isUploadingPicture = false;
  previewImage: string | null = null;

  criticalError = '';
  successMessage = '';

  // Edit form data
  formData = {
    fullName: '',
    bio: ''
  };

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.initializeFormData();

    if (!this.user?.therapistCode) {
      this.authService.fetchMe().pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          if (res.data?.user) {
            this.user = res.data.user;
            this.initializeFormData();
          }
        },
        error: (err) => {
          console.error('Error fetching user:', err);
          this.criticalError = 'Failed to load profile data';
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFormData(): void {
    if (this.user) {
      this.formData.fullName = this.user.fullName || '';
      this.formData.bio = this.user.bio || '';
      this.previewImage = this.user.profilePicture?.url || null;
    }
  }

  get therapistCode(): string {
    return this.user?.therapistCode || this.authService.therapistCode || 'THR-PENDING';
  }

  get profileImageUrl(): string {
    return this.previewImage || this.user?.profilePicture?.url || '/assets/default-avatar.png';
  }

  copyCode(): void {
    if (!this.therapistCode || this.therapistCode === 'THR-PENDING') return;

    navigator.clipboard.writeText(this.therapistCode).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2500);
    }).catch(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2500);
    });
  }

  onProfilePictureSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.criticalError = 'Please upload only image files (JPEG, PNG, GIF, WebP)';
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      this.criticalError = 'File size must be less than 5MB';
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Upload immediately
    this.uploadProfilePicture(file);
  }

  private uploadProfilePicture(file: File): void {
    this.isUploadingPicture = true;
    this.clearMessages();

    const formData = new FormData();
    formData.append('profilePicture', file);

    this.http.post('/api/users/upload-picture', formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.data?.profilePicture?.url) {
            this.user = { ...this.user, profilePicture: response.data.profilePicture } as AuthUser;
            this.previewImage = response.data.profilePicture.url;
            this.authService.updateUser(this.user);
            this.successMessage = 'Profile picture updated successfully';
          }
          this.isUploadingPicture = false;
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.criticalError = err.error?.message || 'Failed to upload profile picture';
          this.isUploadingPicture = false;
        }
      });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.initializeFormData();
    }
    this.clearMessages();
  }

  saveProfile(): void {
    this.clearMessages();

    if (!this.formData.fullName.trim()) {
      this.criticalError = 'Full name is required';
      return;
    }

    this.isSaving = true;

    const token = this.authService.getToken();
    const options: any = {};
    if (token) {
      options.headers = { Authorization: `Bearer ${token}` };
    }

    this.http.put<any>('/api/users/profile', {
      fullName: this.formData.fullName.trim(),
      bio: this.formData.bio.trim()
    }, options)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.data) {
            this.user = response.data as AuthUser;
            this.authService.updateUser(this.user);
            this.successMessage = 'Profile updated successfully';
            this.isEditing = false;
          }
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Update error:', err);
          this.criticalError = err.error?.message || 'Failed to update profile';
          this.isSaving = false;
        }
      });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.initializeFormData();
    this.clearMessages();
  }

  clearMessages(): void {
    this.criticalError = '';
    this.successMessage = '';
  }
}
