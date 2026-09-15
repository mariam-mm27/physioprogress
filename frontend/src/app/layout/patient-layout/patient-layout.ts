import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PatientSidebar } from '../../components/patient-sidebar/patient-sidebar';
import { PatientTopbar } from '../../components/patient-topbar/patient-topbar';

@Component({
  standalone: true,
  imports: [PatientSidebar, PatientTopbar, RouterOutlet],
  selector: 'app-patient-layout',
  styleUrl: './patient-layout.css',
  templateUrl: './patient-layout.html',
})
export class PatientLayout {}