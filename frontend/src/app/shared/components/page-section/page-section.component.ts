import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section [id]="sectionId" [class]="'page-section ' + customClass">
      <div class="page-section-container" [class.fluid]="fluid">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .page-section {
      width: 100%;
      position: relative;
    }

    .page-section-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .page-section-container.fluid {
      max-width: 100%;
      padding: 0;
    }

    @media (max-width: 768px) {
      .page-section-container {
        padding: 0 1rem;
      }
    }
  `]
})
export class PageSectionComponent {
  @Input() sectionId: string = '';
  @Input() customClass: string = '';
  @Input() fluid: boolean = false;
}
