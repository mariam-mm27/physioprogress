import { Routes } from '@angular/router';
import { therapistRoutes } from './pages/therapist/therapist.routes';
import { patientRoutes } from './pages/patient/patient.routes';

export const routes: Routes = [
  ...therapistRoutes,
  ...patientRoutes,
];
