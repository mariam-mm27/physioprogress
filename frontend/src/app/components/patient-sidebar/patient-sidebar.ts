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
    selector: 'app-patient-sidebar',
    styleUrl: './patient-sidebar.css',
    templateUrl: './patient-sidebar.html'
})
export class PatientSidebar {
  constructor(private authService: AuthService, private router: Router) {}

  navItems: navItem[] = [
    { path: 'patient-dashboard', label: 'Patient Dashboard', icon: 'bi-grid-1x2' },
    { path: 'session-logs', label: 'Session Logs & Recovery Analytics', icon: 'bi-bar-chart-line' },
    { path: 'profile-settings', label: 'Profile Settings', icon: 'bi-sliders' },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}