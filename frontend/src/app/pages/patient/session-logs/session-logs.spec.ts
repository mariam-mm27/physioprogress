import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientSessionLogs } from './session-logs';

describe('PatientSessionLogs', () => {
  let component: PatientSessionLogs;
  let fixture: ComponentFixture<PatientSessionLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientSessionLogs],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientSessionLogs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});