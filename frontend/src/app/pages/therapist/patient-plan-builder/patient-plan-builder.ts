import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

// Services
import { ExercisePlanService, CreateExercisePlanPayload, UpdateExercisePlanPayload } from '../../../core/services/exercise-plan.service';
import { TherapistService } from '../../../core/services/therapist.service';
import { Exercise } from '../../../core/models/exercise';
import { ExercisePlan } from '../../../core/models/exercise-plan';

interface PatientData {
  _id: string;
  fullName: string;
  email: string;
  patientCode?: string;
  injuryType?: string;
}

interface MuscleOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-patient-plan-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient-plan-builder.html',
  styleUrl: './patient-plan-builder.css'
})
export class PatientPlanBuilder implements OnInit, OnDestroy {
  private exercisePlanService = inject(ExercisePlanService);
  private therapistService = inject(TherapistService);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  private muscleChange$ = new Subject<string>();

  // Data
  patients: PatientData[] = [];
  exercisePlans: ExercisePlan[] = [];
  muscleOptions: MuscleOption[] = [];
  autoFetchedExercise: Exercise | null = null;

  // Form state
  selectedPatientId = '';
  editingPlan: ExercisePlan | null = null;
  selectedMuscle = '';
  useCustomUrl = false;
  customVideoUrl = '';

  // UI state
  isLoadingPatients = false;
  isSaving = false;
  isAutoFetching = false;

  // Messages - Only critical errors shown to user
  criticalError = '';

  // Form data
  planForm = {
    title: '',
    exerciseName: '',
    targetMuscle: '',
    customMuscle: '',
    reps: 15,
    frequencyPerWeek: 4,
    videoUrl: ''
  };

  ngOnInit(): void {
    console.log('🔥 PatientPlanBuilder ngOnInit called');
    console.log('🔥 Checking authentication...');
    const token = localStorage.getItem('token');
    console.log('🔥 Token exists:', !!token);

    this.loadPatients();
    this.initializeMuscleOptions();
    this.checkRouteParams();
    this.setupMuscleAutoFetch();
    console.log('🔥 PatientPlanBuilder initialization complete', {
      patients: this.patients,
      muscleOptions: this.muscleOptions
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupMuscleAutoFetch(): void {
    console.log('🔥 setupMuscleAutoFetch called');
    this.muscleChange$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(muscle => {
      console.log('🔥 muscleChange$ subscription triggered with:', muscle);
      if (!this.useCustomUrl && muscle && muscle !== 'other') {
        this.autoFetchExerciseMedia(muscle);
      } else {
        console.log('🔥 Skipping auto-fetch - useCustomUrl:', this.useCustomUrl, 'muscle:', muscle);
      }
    });
  }

  private autoFetchExerciseMedia(muscle: string): void {
    console.log('🔥 autoFetchExerciseMedia called with muscle:', muscle);
    this.isAutoFetching = true;
    this.exercisePlanService.searchExercises(muscle).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('🔥 searchExercises response:', response);
        if (response && response.data && response.data.length > 0) {
          console.log('🔥 Exercise found:', response.data[0]);
          this.autoFetchedExercise = response.data[0];
          this.planForm.videoUrl = response.data[0].gifUrl;
          this.planForm.exerciseName = response.data[0].name;
          console.log('🔥 videoUrl set to:', this.planForm.videoUrl);
        } else {
          console.log('🔥 No exercises found in response:', response);
          this.autoFetchedExercise = null;
          this.planForm.videoUrl = '';
        }
        this.isAutoFetching = false;
      },
      error: (err) => {
        console.error('🔥 Error fetching exercise:', err);
        console.error('🔥 Error status:', err.status);
        console.error('🔥 Error message:', err.error?.message || err.message);
        console.error('🔥 Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          url: err.url
        });
        this.isAutoFetching = false;
        this.autoFetchedExercise = null;
        this.planForm.videoUrl = '';
        // Only show critical errors (not 404, which is expected if no exercise found)
        if (err.status && err.status !== 404 && err.status !== 400) {
          console.warn('🔥 Exercise fetch failed but continuing - this is non-critical');
        }
      }
    });
  }

  private initializeMuscleOptions(): void {
    console.log('🔥 initializeMuscleOptions called');
    this.muscleOptions = [
      { value: 'chest', label: 'Chest' },
      { value: 'back', label: 'Back' },
      { value: 'shoulders', label: 'Shoulders' },
      { value: 'biceps', label: 'Biceps' },
      { value: 'triceps', label: 'Triceps' },
      { value: 'forearms', label: 'Forearms' },
      { value: 'abs', label: 'Abs' },
      { value: 'obliques', label: 'Obliques' },
      { value: 'quadriceps', label: 'Quadriceps' },
      { value: 'hamstrings', label: 'Hamstrings' },
      { value: 'glutes', label: 'Glutes' },
      { value: 'calves', label: 'Calves' },
      { value: 'other', label: 'Other' }
    ];
    console.log('🔥 muscleOptions initialized:', this.muscleOptions);
  }

  private checkRouteParams(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['patientId']) {
        this.selectedPatientId = params['patientId'];
        this.loadExercisePlans(this.selectedPatientId);
      }
    });
  }

  loadPatients(): void {
    console.log('🔥 loadPatients called');
    this.isLoadingPatients = true;
    this.therapistService.getTherapistPatients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('🔥 Patients loaded successfully:', response);
          this.isLoadingPatients = false;
          this.patients = response.data || [];
          if (this.patients.length === 0) {
            console.warn('🔥 No patients found for this therapist');
          }
          console.log('🔥 Patients assigned:', this.patients);
        },
        error: (err) => {
          this.isLoadingPatients = false;
          console.error('🔥 Error loading patients:', err);
          console.error('🔥 Error status:', err.status);
          console.error('🔥 Error message:', err.error?.message);
          if (err.status === 401) {
            this.criticalError = 'Session expired. Please login again.';
          } else if (err.status === 403) {
            this.criticalError = 'You do not have permission to view patients';
          } else {
            this.criticalError = 'Failed to load patients';
          }
        }
      });
  }

  selectPatient(patientId: string): void {
    this.selectedPatientId = patientId;
    this.editingPlan = null;
    this.exercisePlans = [];
    this.clearCriticalError();
    if (!patientId) return;
    this.loadExercisePlans(patientId);
  }

  loadExercisePlans(patientId: string): void {
    this.exercisePlanService.getExercisePlans(patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.exercisePlans = response.data || [];
        },
        error: (err) => {
          console.error('Error loading plans:', err);
          this.criticalError = 'Failed to load exercise plans';
        }
      });
  }

  onMuscleChange(value: string): void {
    console.log('🔥 onMuscleChange called with value:', value);
    this.selectedMuscle = value;
    this.planForm.targetMuscle = value === 'other' ? '' : value;
    if (value !== 'other') {
      this.planForm.customMuscle = '';
      if (!this.useCustomUrl) {
        console.log('🔥 Triggering muscleChange$ with:', value);
        this.muscleChange$.next(value);
      }
    } else {
      this.autoFetchedExercise = null;
      this.planForm.videoUrl = '';
    }
  }

  savePlan(): void {
    this.clearCriticalError();

    if (!this.selectedPatientId) {
      this.criticalError = 'Select a patient first';
      return;
    }

    if (!this.planForm.title.trim()) {
      this.criticalError = 'Title is required';
      return;
    }

    const targetMuscle = this.selectedMuscle === 'other' ? this.planForm.customMuscle : this.planForm.targetMuscle;
    if (!targetMuscle?.trim()) {
      this.criticalError = 'Target muscle is required';
      return;
    }

    if (!this.planForm.reps || this.planForm.reps <= 0) {
      this.criticalError = 'Valid reps count is required';
      return;
    }

    this.isSaving = true;

    if (this.editingPlan) {
      const updateData: UpdateExercisePlanPayload = {
        title: this.planForm.title.trim(),
        exerciseName: this.planForm.exerciseName || this.editingPlan.exerciseName,
        targetMuscle: targetMuscle.trim(),
        customMuscle: this.selectedMuscle === 'other' ? targetMuscle.trim() : '',
        reps: this.planForm.reps,
        frequencyPerWeek: this.planForm.frequencyPerWeek,
        videoUrl: this.useCustomUrl ? this.customVideoUrl : this.planForm.videoUrl,
        videoSource: this.useCustomUrl ? 'custom' : 'api'
      };

      this.exercisePlanService.updateExercisePlan(this.editingPlan._id, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            const index = this.exercisePlans.findIndex(p => p._id === response.data._id);
            if (index !== -1) {
              this.exercisePlans[index] = response.data;
            }
            this.cancelEdit();
            this.isSaving = false;
          },
          error: (err) => {
            console.error('Update error:', err);
            this.criticalError = 'Failed to update plan';
            this.isSaving = false;
          }
        });
      return;
    }

    const createData: CreateExercisePlanPayload = {
      title: this.planForm.title.trim(),
      exerciseName: this.planForm.exerciseName || targetMuscle.trim(),
      reps: this.planForm.reps,
      frequencyPerWeek: this.planForm.frequencyPerWeek,
      videoUrl: this.useCustomUrl ? this.customVideoUrl : (this.planForm.videoUrl || ''),
      targetMuscle: targetMuscle.trim(),
      customMuscle: this.selectedMuscle === 'other' ? targetMuscle.trim() : '',
      videoSource: this.useCustomUrl ? 'custom' : 'api'
    };

    this.exercisePlanService.createExercisePlan(this.selectedPatientId, createData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.exercisePlans = [response.data, ...this.exercisePlans];
          this.resetForm();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Create error:', err);
          this.criticalError = 'Failed to create plan';
          this.isSaving = false;
        }
      });
  }

  editPlan(plan: ExercisePlan): void {
    this.editingPlan = plan;
    this.planForm.title = plan.title;
    this.planForm.exerciseName = plan.exerciseName;
    this.planForm.targetMuscle = plan.targetMuscle;
    this.planForm.customMuscle = plan.customMuscle ?? '';
    this.planForm.reps = plan.reps;
    this.planForm.frequencyPerWeek = plan.frequencyPerWeek;
    this.planForm.videoUrl = plan.videoUrl;
    this.selectedMuscle = plan.customMuscle ? 'other' : (plan.targetMuscle || '');
    this.useCustomUrl = plan.videoSource === 'custom';
    this.customVideoUrl = plan.videoUrl;
    this.clearCriticalError();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deletePlan(planId: string): void {
    if (!window.confirm('Delete this plan?')) return;
    this.clearCriticalError();
    this.exercisePlanService.deleteExercisePlan(planId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.exercisePlans = this.exercisePlans.filter(p => p._id !== planId);
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.criticalError = 'Failed to delete plan';
        }
      });
  }

  cancelEdit(): void {
    this.editingPlan = null;
    this.resetForm();
  }

  resetForm(): void {
    this.planForm = {
      title: '',
      exerciseName: '',
      targetMuscle: '',
      customMuscle: '',
      reps: 15,
      frequencyPerWeek: 4,
      videoUrl: ''
    };
    this.selectedMuscle = '';
    this.useCustomUrl = false;
    this.customVideoUrl = '';
    this.autoFetchedExercise = null;
  }

  clearCriticalError(): void {
    this.criticalError = '';
  }

  get selectedPatient(): PatientData | undefined {
    return this.patients.find(p => p._id === this.selectedPatientId);
  }

  get showCustomMuscle(): boolean {
    return this.selectedMuscle === 'other';
  }

  get videoPreviewUrl(): string {
    return this.useCustomUrl ? this.customVideoUrl : this.planForm.videoUrl;
  }

  toggleMediaSource(useCustom: boolean): void {
    this.useCustomUrl = useCustom;
    if (!useCustom && this.selectedMuscle && this.selectedMuscle !== 'other') {
      this.muscleChange$.next(this.selectedMuscle);
    }
  }
}
