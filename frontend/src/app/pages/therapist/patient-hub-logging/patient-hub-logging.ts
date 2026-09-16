import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionLogService } from '../../../core/services/session-log.service';
import { AssignedPatient } from '../../../core/models/patient';
import { SessionLog } from '../../../core/models/session-log';
import { AnalyticsPeriod, PatientAnalytics } from '../../../core/models/analytics';

const PAGE_SIZE = 4;
const HIGH_PAIN_THRESHOLD = 6;

type LogTab = 'all' | 'highPain';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-patient-hub-logging',
  styleUrl: './patient-hub-logging.css',
  templateUrl: './patient-hub-logging.html',
})
export class PatientHubLogging implements OnInit {
  private sessionLogService = inject(SessionLogService);

  patients = signal<AssignedPatient[]>([]);
  selectedPatientId = signal<string>('');
  startDate = signal<string>(this.localDaysAgo(7));
  endDate = signal<string>(this.localToday());

  hasSearched = signal(false);
  loadingLogs = signal(false);
  loadingAnalytics = signal(false);
  errorMessage = signal<string | null>(null);

  allLogs = signal<SessionLog[]>([]);
  analytics = signal<PatientAnalytics | null>(null);
  activeTab = signal<LogTab>('all');
  currentPage = signal(1);

  filteredLogs = computed(() => {
    const logs = this.allLogs();
    return this.activeTab() === 'highPain'
      ? logs.filter((l) => l.painLevel > HIGH_PAIN_THRESHOLD)
      : logs;
  });

  highPainCount = computed(() => this.allLogs().filter((l) => l.painLevel > HIGH_PAIN_THRESHOLD).length);

  totalPages = computed(() => Math.max(Math.ceil(this.filteredLogs().length / PAGE_SIZE), 1));

  pagedLogs = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filteredLogs().slice(start, start + PAGE_SIZE);
  });

  /** Days covered by the selected startDate→endDate window. */
  selectedRangeInDays = computed(() => {
    const start = new Date(`${this.startDate()}T00:00:00`);
    const end = new Date(`${this.endDate()}T00:00:00`);
    return Math.max(Math.round((end.getTime() - start.getTime()) / 86_400_000), 0);
  });

  /** Which preset matches the current window: 0→Today, 1–7→7 Days, >7→30 Days. */
  activePreset = computed<'today' | '7days' | '30days'>(() => {
    const days = this.selectedRangeInDays();
    if (days <= 0) return 'today';
    if (days <= 7) return '7days';
    return '30days';
  });

  ngOnInit(): void {
    this.sessionLogService.getAssignedPatients().subscribe({
      next: (res) => {
        this.patients.set(res.data);
        if (res.data.length > 0) {
          this.selectedPatientId.set(res.data[0]._id);
        }
      },
      error: () => this.patients.set([]),
    });
  }

  canApply(): boolean {
    return !!this.selectedPatientId();
  }

  applyFilters(): void {
    if (!this.canApply()) return;
    this.hasSearched.set(true);
    this.activeTab.set('all');
    this.currentPage.set(1);
    this.fetchLogs();
    this.fetchAnalytics();
  }

  setPreset(days: number): void {
    this.endDate.set(this.localToday());
    this.startDate.set(this.localDaysAgo(days));
  }

  selectTab(tab: LogTab): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
  }

  private fetchLogs(): void {
    this.loadingLogs.set(true);
    this.sessionLogService.getPatientLogs(this.selectedPatientId(), this.startDate(), this.endDate()).subscribe({
      next: (res) => {
        this.allLogs.set(res.data);
        this.loadingLogs.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load session logs from the server.');
        this.loadingLogs.set(false);
      },
    });
  }

  private fetchAnalytics(): void {
    const period: AnalyticsPeriod = this.selectedRangeInDays() <= 7 ? 'weekly' : 'monthly';
    this.loadingAnalytics.set(true);
    this.sessionLogService.getPatientAnalytics(this.selectedPatientId(), period).subscribe({
      next: (res) => {
        this.analytics.set(res.data);
        this.loadingAnalytics.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load adherence analytics from the server.');
        this.loadingAnalytics.set(false);
      },
    });
  }

  /** Local YYYY-MM-DD — backend reads the query as `T00:00:00.000Z`, so send
   *  local calendar dates, not `toISOString()` (which shifts to UTC). */
  private localToday(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private localDaysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}