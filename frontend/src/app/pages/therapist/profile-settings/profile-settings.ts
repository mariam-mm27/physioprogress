import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './profile-settings.css',
  templateUrl: './profile-settings.html',
})
export class ProfileSettings implements OnInit {
  user: AuthUser | null = null;
  copied = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (!this.user?.therapistCode) {
      this.authService.fetchMe().subscribe({
        next: (res) => {
          if (res.data?.user) {
            this.user = res.data.user;
          }
        }
      });
    }
  }

  get therapistCode(): string {
    return this.user?.therapistCode || this.authService.therapistCode || 'THR-PENDING';
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
}
