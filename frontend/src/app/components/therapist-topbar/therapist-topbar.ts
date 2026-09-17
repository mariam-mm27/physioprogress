import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
    imports: [CommonModule],
    selector: 'app-therapist-topbar',
    styleUrl: './therapist-topbar.css',
    templateUrl: './therapist-topbar.html'
})
export class TherapistTopbar {
  user: AuthUser | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if(!this.user) {
       this.authService.fetchMe().subscribe({
        next: (res) => { if (res.data?.user) this.user = res.data.user; },
        error: () => {}
      });
  }}

  get userName(): string {
    return this.user?.fullName || 'Therapist Account';
  }

  get userId(): string {
    return this.user?.therapistCode || 'ID #-';
  }
}