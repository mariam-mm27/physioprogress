import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { HeroSectionComponent } from './sections/hero-section/hero-section.component';
import { FeaturesComponent } from './sections/features/features.component';
import { AboutComponent } from './sections/about/about.component';
import { CalloutComponent } from './sections/callout/callout.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
    selector: 'app-landing',
    imports: [
        CommonModule,
        NavbarComponent,
        HeroSectionComponent,
        FeaturesComponent,
        AboutComponent,
        CalloutComponent,
        FooterComponent
    ],
    template: `
    <div class="bg-dark-primary min-vh-100">
      <app-navbar></app-navbar>
      <main style="margin-top: 0; padding: 0;">
        <app-hero-section id="overview"></app-hero-section>
        <app-features id="features"></app-features>
        <app-about id="about"></app-about>
        <app-callout></app-callout>
      </main>
      <app-footer id="contact"></app-footer>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      background-color: #09090b;
      min-height: 100vh;
    }
  `]
})
export class LandingComponent {}


