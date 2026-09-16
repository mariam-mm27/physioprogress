import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-callout',
    imports: [CommonModule, RouterLink],
    templateUrl: './callout.component.html',
    styleUrl: './callout.component.css'
})
export class CalloutComponent {}
