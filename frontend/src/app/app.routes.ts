import { Routes } from '@angular/router';
import { DashboardComponent } from './features/patient/pages/dashboard/dashboard.component';
import { Component } from '@angular/core';
export const routes: Routes = [{ 
    path : 'patient/dashboard',
    component: DashboardComponent
},
{
    path: '', 
    redirectTo: 'patient/dashboard', 
    pathMatch: 'full'
}
];
