import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TherapistDashboard } from './therapist-dashboard';

describe('TherapistDashboard', () => {
  let component: TherapistDashboard;
  let fixture: ComponentFixture<TherapistDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TherapistDashboard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TherapistDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
