import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    message: ''
  };

  isSubmitted = false;

  onSubmit(): void {
    if (!this.formData.name.trim() || !this.formData.email.trim() || !this.formData.message.trim()) {
      return;
    }

    console.log('Message recorded:', {
      name: this.formData.name,
      email: this.formData.email,
      message: this.formData.message,
      timestamp: new Date().toISOString()
    });

    this.isSubmitted = true;

    this.formData = { name: '', email: '', message: '' };

    setTimeout(() => {
      this.isSubmitted = false;
    }, 4000);
  }
}
