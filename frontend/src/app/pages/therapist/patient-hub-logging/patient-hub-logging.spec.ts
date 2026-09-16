import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientHubLogging } from './patient-hub-logging';

describe('PatientHubLogging', () => {
  let component: PatientHubLogging;
  let fixture: ComponentFixture<PatientHubLogging>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientHubLogging],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientHubLogging);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
