import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TherapistDashboard } from './therapist-dashboard';

describe('TherapistDashboard', () => {
  let component: TherapistDashboard;
  let fixture: ComponentFixture<TherapistDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TherapistDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(TherapistDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
