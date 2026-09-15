import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientPlanBuilder } from './patient-plan-builder';

describe('PatientPlanBuilder', () => {
  let component: PatientPlanBuilder;
  let fixture: ComponentFixture<PatientPlanBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPlanBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientPlanBuilder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
