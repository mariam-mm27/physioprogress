import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-patient-topbar',
  styleUrl: './patient-topbar.css',
  templateUrl: './patient-topbar.html',
})
export class PatientTopbar {
  patientCode = 'PT-0831';
  userName = 'Maya Hernandez';
  userId = 'ID #0831-PHX';
}