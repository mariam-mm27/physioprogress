
import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  ExercisePlanService,
  CreateExercisePlanPayload,
  UpdateExercisePlanPayload
} from '../../../core/services/exercise-plan.service';

import { Exercise } from '../../../core/models/exercise';
import { AssignedPatient } from '../../../core/models/patient';
import { ExercisePlan } from '../../../core/models/exercise-plan';

@Component({
  selector: 'app-patient-plan-builder',

  imports: [
    FormsModule
  ],

  templateUrl: './patient-plan-builder.html',

  styleUrl: './patient-plan-builder.css'
})
export class PatientPlanBuilder implements OnInit {

  private exercisePlanService =
    inject(ExercisePlanService);


  // =========================
  // DATA
  // =========================

  patients: AssignedPatient[] = [];

  exercises: Exercise[] = [];

  exercisePlans: ExercisePlan[] = [];


  // =========================
  // SELECTION
  // =========================

  selectedPatientId = '';

  selectedExercise: Exercise | null = null;

  editingPlan: ExercisePlan | null = null;


  // =========================
  // SEARCH
  // =========================

  muscleSearch = '';

  isSearching = false;


  // =========================
  // FORM
  // =========================

  planForm = {
    title: '',
    exerciseName: '',
    targetMuscle: '',
    customMuscle: '',
    reps: 15,
    frequencyPerWeek: 4
  };


  isSaving = false;


  // =========================
  // MESSAGES
  // =========================

  successMessage = '';

  errorMessage = '';


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.loadPatients();

  }


  // =========================
  // LOAD PATIENTS
  // =========================

  loadPatients(): void {

    this.exercisePlanService
      .getAssignedPatients()
      .subscribe({

        next: (response) => {

          this.patients = response.data;

        },

        error: (error) => {

          console.error(
            'Error loading patients:',
            error
          );

          this.errorMessage =
            'Unable to load assigned patients.';

        }

      });

  }


  // =========================
  // SELECT PATIENT
  // =========================

  selectPatient(patientId: string): void {

    this.selectedPatientId = patientId;

    this.selectedExercise = null;

    this.editingPlan = null;

    this.exercisePlans = [];

    this.clearMessages();


    if (!patientId) {

      return;

    }


    this.loadExercisePlans(patientId);

  }


  // =========================
  // LOAD PLANS
  // =========================

  loadExercisePlans(patientId: string): void {

    this.exercisePlanService
      .getExercisePlans(patientId)
      .subscribe({

        next: (response) => {

          this.exercisePlans =
            response.data;

        },

        error: (error) => {

          console.error(
            'Error loading exercise plans:',
            error
          );

          this.errorMessage =
            'Unable to load exercise plans.';

        }

      });

  }


  // =========================
  // SEARCH EXERCISES
  // =========================

  searchExercises(): void {

    const muscle =
      this.muscleSearch.trim();


    if (!muscle) {

      this.errorMessage =
        'Please enter a muscle to search.';

      return;

    }


    this.isSearching = true;

    this.clearMessages();


    this.exercisePlanService
      .searchExercises(muscle)
      .subscribe({

        next: (response) => {

          this.exercises =
            response.data;

          this.isSearching = false;

        },

        error: (error) => {

          console.error(
            'Error searching exercises:',
            error
          );

          this.exercises = [];

          this.isSearching = false;

          this.errorMessage =
            'Unable to search exercises.';

        }

      });

  }


  // =========================
  // SELECT EXERCISE
  // =========================

  selectExercise(exercise: Exercise): void {

    this.selectedExercise =
      exercise;


    this.planForm.exerciseName =
      exercise.name;


    this.planForm.targetMuscle =
      exercise.targetMuscles.length > 0
        ? exercise.targetMuscles[0]
        : '';


    this.clearMessages();

  }


  // =========================
  // CREATE / UPDATE PLAN
  // =========================

  savePlan(): void {

    this.clearMessages();


    // =========================
    // CHECK PATIENT
    // =========================

    if (!this.selectedPatientId) {

      this.errorMessage =
        'Please select a patient first.';

      return;

    }


    // =========================
    // CHECK EXERCISE
    // =========================

    if (
      !this.selectedExercise &&
      !this.editingPlan
    ) {

      this.errorMessage =
        'Please select an exercise first.';

      return;

    }


    // =========================
    // CHECK TITLE
    // =========================

    if (
      !this.planForm.title.trim()
    ) {

      this.errorMessage =
        'Exercise title is required.';

      return;

    }


    // =========================
    // CHECK TARGET MUSCLE
    // =========================

    if (
      !this.planForm.targetMuscle.trim()
    ) {

      this.errorMessage =
        'Target muscle is required.';

      return;

    }


    // =========================
    // CHECK REPS
    // =========================

    if (
      !this.planForm.reps ||
      this.planForm.reps <= 0
    ) {

      this.errorMessage =
        'Reps must be greater than 0.';

      return;

    }


    // =========================
    // CHECK FREQUENCY
    // =========================

    if (
      !this.planForm.frequencyPerWeek ||
      this.planForm.frequencyPerWeek <= 0
    ) {

      this.errorMessage =
        'Frequency must be greater than 0.';

      return;

    }


    this.isSaving = true;


    // =========================
    // UPDATE EXISTING PLAN
    // =========================

    if (this.editingPlan) {

      const updateData:
        UpdateExercisePlanPayload = {

        title:
          this.planForm.title.trim(),

        exerciseName:
          this.editingPlan.exerciseName,

        targetMuscle:
          this.planForm.targetMuscle.trim(),

        customMuscle:
          this.planForm.customMuscle.trim(),

        reps:
          this.planForm.reps,

        frequencyPerWeek:
          this.planForm.frequencyPerWeek,

        videoUrl:
          this.editingPlan.videoUrl,

        videoSource:
          this.editingPlan.videoSource

      };


      this.exercisePlanService
        .updateExercisePlan(
          this.editingPlan._id,
          updateData
        )
        .subscribe({

          next: (response) => {

            const index =
              this.exercisePlans.findIndex(
                plan =>
                  plan._id ===
                  response.data._id
              );


            if (index !== -1) {

              this.exercisePlans[index] =
                response.data;

            }


            this.successMessage =
              'Exercise plan updated successfully.';


            this.cancelEdit();

            this.isSaving = false;

          },


          error: (error) => {

            console.error(
              'Error updating plan:',
              error
            );

            this.errorMessage =
              'Unable to update exercise plan.';

            this.isSaving = false;

          }

        });


      return;

    }


    // =========================
    // CREATE NEW PLAN
    // =========================

    const createData:
      CreateExercisePlanPayload = {

      title:
        this.planForm.title.trim(),

      exerciseName:
        this.selectedExercise!.name,

      reps:
        this.planForm.reps,

      frequencyPerWeek:
        this.planForm.frequencyPerWeek,

      videoUrl:
        this.selectedExercise!.gifUrl,

      targetMuscle:
        this.planForm.targetMuscle.trim(),

      customMuscle:
        this.planForm.customMuscle.trim(),

      videoSource:
        'api'

    };


    this.exercisePlanService
      .createExercisePlan(
        this.selectedPatientId,
        createData
      )
      .subscribe({

        next: (response) => {

          this.exercisePlans = [
            response.data,
            ...this.exercisePlans
          ];


          this.successMessage =
            'Exercise plan published successfully.';


          this.resetForm();

          this.isSaving = false;

        },


        error: (error) => {

          console.error(
            'Error creating plan:',
            error
          );

          this.errorMessage =
            'Unable to create exercise plan.';

          this.isSaving = false;

        }

      });

  }


  // =========================
  // EDIT PLAN
  // =========================

  editPlan(plan: ExercisePlan): void {

    this.editingPlan =
      plan;


    this.planForm.title =
      plan.title;


    this.planForm.exerciseName =
      plan.exerciseName;


    this.planForm.targetMuscle =
      plan.targetMuscle;


    this.planForm.customMuscle =
      plan.customMuscle ?? '';


    this.planForm.reps =
      plan.reps;


    this.planForm.frequencyPerWeek =
      plan.frequencyPerWeek;


    this.clearMessages();


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  // =========================
  // DELETE PLAN
  // =========================

  deletePlan(planId: string): void {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this exercise plan?'
      );


    if (!confirmed) {

      return;

    }


    this.clearMessages();


    this.exercisePlanService
      .deleteExercisePlan(planId)
      .subscribe({

        next: () => {

          this.exercisePlans =
            this.exercisePlans.filter(
              plan =>
                plan._id !== planId
            );


          this.successMessage =
            'Exercise plan deleted successfully.';

        },


        error: (error) => {

          console.error(
            'Error deleting plan:',
            error
          );

          this.errorMessage =
            'Unable to delete exercise plan.';

        }

      });

  }


  // =========================
  // CANCEL EDIT
  // =========================

  cancelEdit(): void {

    this.editingPlan = null;

    this.resetForm();

  }


  // =========================
  // RESET FORM
  // =========================

  resetForm(): void {

    this.planForm = {

      title: '',

      exerciseName: '',

      targetMuscle: '',

      customMuscle: '',

      reps: 15,

      frequencyPerWeek: 4

    };


    this.selectedExercise = null;

  }


  // =========================
  // CLEAR MESSAGES
  // =========================

  clearMessages(): void {

    this.successMessage = '';

    this.errorMessage = '';

  }


  // =========================
  // SELECTED PATIENT
  // =========================

  get selectedPatient():
    AssignedPatient | undefined {

    return this.patients.find(
      patient =>
        patient._id ===
        this.selectedPatientId
    );

  }

}
