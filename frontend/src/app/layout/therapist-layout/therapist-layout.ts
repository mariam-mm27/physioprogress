import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TherapistSidebar } from '../../components/therapist-sidebar/therapist-sidebar';
import { TherapistTopbar } from '../../components/therapist-topbar/therapist-topbar';

@Component({
  imports: [TherapistSidebar, TherapistTopbar, RouterOutlet],
  selector: 'app-therapist-layout',
  styleUrl: './therapist-layout.css',
  templateUrl: './therapist-layout.html',
})
export class TherapistLayout {}