import { Routes } from '@angular/router';
import { TherapistLayout } from '../../layout/therapist-layout/therapist-layout';
import { TherapistDashboard } from './therapist-dashboard/therapist-dashboard';
import { PatientPlanBuilder } from './patient-plan-builder/patient-plan-builder';
import { PatientHubLogging } from './patient-hub-logging/patient-hub-logging';
import { SessionHistoryCharts } from './session-history-charts/session-history-charts';
import { ProfileSettings } from './profile-settings/profile-settings';
import { authGuard } from '../../core/guards/auth.guard';

export const therapistRoutes: Routes = [
  {
    path: 'therapist',
    component: TherapistLayout,
    canActivate: [authGuard],
    data: { role: 'therapist' },
    children: [
      { path: '', redirectTo: 'therapist-dashboard', pathMatch: 'full' },
      { path: 'therapist-dashboard', component: TherapistDashboard },
      { path: 'patient-plan-builder', component: PatientPlanBuilder },
      { path: 'patient-hub-logging', component: PatientHubLogging },
      { path: 'session-history-charts', component: SessionHistoryCharts },
      { path: 'profile-settings', component: ProfileSettings },
    ],
  },
];