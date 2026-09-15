import { Routes } from '@angular/router';
import { PatientLayout } from '../../layout/patient-layout/patient-layout';
import { PatientDashboard } from './patient-dashboard/patient-dashboard';
import { PatientSessionLogs } from './session-logs/session-logs';
import { PatientProfileSettings } from './profile-settings/profile-settings';

export const patientRoutes: Routes = [
  {
    path: 'patient',
    component: PatientLayout,
    children: [
      { path: '', redirectTo: 'patient-dashboard', pathMatch: 'full' },
      { path: 'patient-dashboard', component: PatientDashboard },
      { path: 'session-logs', component: PatientSessionLogs },
      { path: 'profile-settings', component: PatientProfileSettings },
    ],
  },
];