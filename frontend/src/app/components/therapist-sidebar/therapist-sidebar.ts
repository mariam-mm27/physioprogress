import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface navItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  imports: [RouterLink, RouterLinkActive],
  standalone: true,
  selector: 'app-therapist-sidebar',
  styleUrl: './therapist-sidebar.css',
  templateUrl: './therapist-sidebar.html',
})
export class TherapistSidebar {
  constructor(private authService: AuthService, private router: Router) {}

  navItems: navItem[] = [
    { path: 'therapist-dashboard', label: 'Therapist Dashboard', icon: 'bi-grid-1x2' },
    { path: 'patient-plan-builder', label: 'Patient Plan Builder', icon: 'bi bi-clipboard-plus' },
    { path: 'patient-hub-logging', label: 'Patient Hub & Logging', icon: 'bi bi-person-lines-fill' },
    { path: 'session-history-charts', label: 'Session History & Charts', icon: 'bi-bar-chart-line' },
    { path: 'profile-settings', label: 'Profile Settings', icon: 'bi-sliders' },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
