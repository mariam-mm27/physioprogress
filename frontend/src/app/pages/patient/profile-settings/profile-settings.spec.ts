import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientProfileSettings } from './profile-settings';

describe('PatientProfileSettings', () => {
  let component: PatientProfileSettings;
  let fixture: ComponentFixture<PatientProfileSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientProfileSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientProfileSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});