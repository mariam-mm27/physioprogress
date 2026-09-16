import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PatientDashboard } from './patient-dashboard';

describe('PatientDashboard', () => {
  let component: PatientDashboard;
  let fixture: ComponentFixture<PatientDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDashboard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});