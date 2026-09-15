import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface navItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-patient-sidebar',
  styleUrl: './patient-sidebar.css',
  templateUrl: './patient-sidebar.html',
})
export class PatientSidebar {
navItems: navItem[] = [
    { path: 'patient-dashboard', label: 'Patient Dashboard', icon: 'bi-grid-1x2' },
    { path: 'session-logs', label: 'Session Logs & Recovery', icon: 'bi-bar-chart-line' },
    { path: 'profile-settings', label: 'Profile Settings', icon: 'bi-sliders' },
    {path: 'landing', label: 'Logout', icon: 'bi bi-box-arrow-left' },
  ];
}