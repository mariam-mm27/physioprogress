import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';

interface navItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-patient-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  styleUrl: './patient-sidebar.css',
  templateUrl: './patient-sidebar.html'
})
export class PatientSidebar implements OnInit {

  navItems: navItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.navItems = [
      {
        path: 'patient-dashboard',
        label: 'Patient Dashboard',
        icon: 'bi-grid-1x2'
      },
      {
        path: 'session-logs',
        label: 'Session Logs & Recovery Analytics',
        icon: 'bi-bar-chart-line'
      },
      {
        path: 'profile-settings',
        label: 'Profile Settings',
        icon: 'bi-sliders'
      }
    ];
  }

  get patientName(): string {
    return this.authService.getUser()?.fullName || 'Patient';
  }

  get patientId(): string {
    return this.authService.getUser()?._id || '';
  }

  get patientInitials(): string {
    const name = this.patientName.trim();

    if (!name || name === 'Patient') {
      return 'P';
    }

    const words = name.split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}