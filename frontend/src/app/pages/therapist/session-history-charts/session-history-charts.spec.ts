import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionHistoryCharts } from './session-history-charts';

describe('SessionHistoryCharts', () => {
  let component: SessionHistoryCharts;
  let fixture: ComponentFixture<SessionHistoryCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionHistoryCharts],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionHistoryCharts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
