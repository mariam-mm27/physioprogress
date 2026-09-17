import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { SessionLogService } from '../../../core/services/session-log.service';
import { SessionLog, UpdateSessionLogPayload, ExercisePlan } from '../../../core/models/session-log';
import { AnalyticsPeriod, PatientAnalytics } from '../../../core/models/analytics';

type RangePreset = 7 | 30 | 60;

interface ChartPoint {
  x: number;
  y: number;
  log: SessionLog;
}

interface LogFormState {
  id?: string;
  planId: string;
  planLabel: string;
  painLevel: number;
  completed: boolean;
  notes: string;
  loggedAt: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-patient-session-logs',
  styleUrl: './session-logs.css',
  templateUrl: './session-logs.html',
})
export class PatientSessionLogs implements OnInit {
  patientId: string | null = null;

  logs: SessionLog[] = [];
  loadingLogs = false;
  logsError: string | null = null;

  activePreset: RangePreset = 7;
  fromDate = '';
  toDate = '';

  analyticsPeriod: AnalyticsPeriod = 'weekly';
  analytics: PatientAnalytics | null = null;
  loadingAnalytics = false;

  page = 1;
  pageSize = 5;

  showModal = false;
  saving = false;
  modalError: string | null = null;
  form: LogFormState = {
    id: '',
    planId: '',
    planLabel: '',
    painLevel: 1,
    completed: false,
    notes: '',
    loggedAt: '',
  };

  toastVisible = false;
  toastTitle = '';
  toastMsg = '';

  constructor(private auth: AuthService, private sessionLogService: SessionLogService) {}

  ngOnInit(): void {
    this.patientId = this.auth.user?._id ?? null;
    //this.setRange(7);
  }

  setRange(days: RangePreset): void {
    this.activePreset = days;
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    this.toDate = this.toIsoDate(end);
    this.fromDate = this.toIsoDate(start);

    this.analyticsPeriod = days === 7 ? 'weekly' : 'monthly';

    this.loadLogs();
    this.loadAnalytics();
  }

  applyCustomRange(): void {
  if (!this.fromDate || !this.toDate) {
    this.showToast('Missing dates', 'Choose both a From and To date.');
    return;
  }
  if (this.fromDate > this.toDate) {
    this.showToast('Invalid range', 'From date cannot be after To date.');
    return;
  }
  this.activePreset = 0 as unknown as RangePreset;
  this.loadLogs();
  this.loadAnalytics();
  this.showToast('Filter applied', `${this.fromDate} → ${this.toDate}`);
}
  private toIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  loadLogs(): void {
    if (!this.patientId) return;
    this.loadingLogs = true;
    this.logsError = null;

    this.sessionLogService.getPatientLogs(this.patientId, this.fromDate, this.toDate).subscribe({
      next: (res) => {
        this.logs = [...res.data].sort(
          (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
        );
        this.page = 1;
        this.loadingLogs = false;
      },
      error: (err: any) => {
        this.logsError = err?.error?.message || 'Could not load session logs.';
        this.loadingLogs = false;
      },
    });
  }

  loadAnalytics(): void {
    if (!this.patientId) return;
    this.loadingAnalytics = true;

    this.sessionLogService.getPatientAnalytics(this.patientId, this.analyticsPeriod).subscribe({
      next: (res) => {
        this.analytics = res.data;
        this.loadingAnalytics = false;
      },
      error: () => {
        this.analytics = null;
        this.loadingAnalytics = false;
      },
    });
  }

  get totalLogsInRange(): number {
    return this.logs.length;
  }

  get avgPainInRange(): number | null {
    if (!this.logs.length) return null;
    const sum = this.logs.reduce((acc, l) => acc + l.painLevel, 0);
    return Math.round((sum / this.logs.length) * 10) / 10;
  }

  get painTrendPerDay(): number | null {
    if (this.logs.length < 2) return null;

    const points = [...this.logs]
      .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
      .map((l, i) => ({ x: i, y: l.painLevel }));

    const n = points.length;
    const sumX = points.reduce((a, p) => a + p.x, 0);
    const sumY = points.reduce((a, p) => a + p.y, 0);
    const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
    const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0);

    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return 0;

    const slope = (n * sumXY - sumX * sumY) / denom;
    return Math.round(slope * 100) / 100;
  }

  get chartPoints(): ChartPoint[] {
    const sorted = [...this.logs].sort(
      (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
    );
    if (!sorted.length) return [];

    const width = 800;
    const height = 220;
    const padding = 30;
    const usableWidth = width - padding * 2;

    return sorted.map((log, i) => {
      const x = sorted.length === 1 ? width / 2 : padding + (i / (sorted.length - 1)) * usableWidth;
      const y = 200 - ((log.painLevel - 1) / 9) * 180;
      return { x, y, log };
    });
  }

  get chartPolylinePoints(): string {
    return this.chartPoints.map((p) => `${p.x},${p.y}`).join(' ');
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.logs.length / this.pageSize));
  }

  get pagedLogs(): SessionLog[] {
    const start = (this.page - 1) * this.pageSize;
    return this.logs.slice(start, start + this.pageSize);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
  }

  painBadgeClass(level: number): string {
    if (level <= 3) return 'pain-badge pain-low';
    if (level <= 6) return 'pain-badge pain-mid';
    return 'pain-badge pain-high';
  }

  painLabel(level: number): string {
    if (level <= 3) return 'Low';
    if (level <= 6) return 'Moderate';
    return 'High';
  }

  planInfo(planId: string | ExercisePlan | null | undefined): { name: string; meta: string } | null {
    if (!planId) return null;
    if (typeof planId === 'string') return { name: planId.slice(-6), meta: '' };
    const plan = planId as ExercisePlan;
    return {
      name: plan.exerciseName || plan.title || 'Untitled plan',
      meta: `${plan.reps ?? 0} reps · ${plan.frequencyPerWeek ?? 0}/week · ${plan.targetMuscle ?? ''}`,
    };
  }

  openEditModal(log: SessionLog): void {
    const info = this.planInfo(log.planId);
    const plan = log.planId;
    const resolvedPlanId = typeof plan === 'string'
      ? plan
      : ((plan as ExercisePlan | null)?._id ?? '');

    this.form = {
      id: log._id,
      planId: resolvedPlanId,
      planLabel: info?.name ?? '',
      painLevel: log.painLevel,
      completed: log.completed,
      notes: log.notes ?? '',
      loggedAt: log.loggedAt,
    };
    this.modalError = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.saving = false;
    this.modalError = null;
  }

  submitModal(): void {
    if (this.form.painLevel < 1 || this.form.painLevel > 10) {
      this.modalError = 'Pain level must be between 1 and 10.';
      return;
    }
    if (!this.form.id) return;

    this.saving = true;
    this.modalError = null;

    const payload: UpdateSessionLogPayload = {
      painLevel: this.form.painLevel,
      completed: this.form.completed,
      notes: this.form.notes,
    };
    this.sessionLogService.updateLog(this.form.id, payload).subscribe({
      next: () => {
        this.closeModal();
        this.loadLogs();
        this.loadAnalytics();
        this.showToast('Log updated', 'Changes were saved (PUT /api/logs/:id).');
      },
      error: (err: any) => {
        this.saving = false;
        this.modalError = err?.error?.message || 'Could not update session log.';
      },
    });
  }

  confirmDelete(log: SessionLog): void {
    const ok = confirm('Delete this session log? This cannot be undone.');
    if (!ok) return;

    this.sessionLogService.deleteLog(log._id).subscribe({
      next: () => {
        this.loadLogs();
        this.loadAnalytics();
        this.showToast('Log deleted', 'The session record was removed (DELETE /api/logs/:id).');
      },
      error: (err: any) => {
        this.showToast('Delete failed', err?.error?.message || 'Could not delete this log.');
      },
    });
  }

  showToast(title: string, msg: string): void {
    this.toastTitle = title;
    this.toastMsg = msg;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 2000);
  }
}
