import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PatientProfileSettings } from './profile-settings';

describe('PatientProfileSettings', () => {
  let component: PatientProfileSettings;
  let fixture: ComponentFixture<PatientProfileSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientProfileSettings],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientProfileSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});