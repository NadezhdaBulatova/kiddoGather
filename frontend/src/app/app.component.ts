import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { MainComponent } from './main/main/main.component';
import { CommonModule } from '@angular/common';
import { MeetComponent } from './meet/meet/meet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MainComponent,
    RouterOutlet,
    CommonModule,
    RouterLink,
    MeetComponent,
    RouterLinkActive,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor(protected router: Router) {}
  get isAccountPage(): boolean {
    return (
      this.router.url === '/login' ||
      this.router.url === '/register' ||
      this.router.url.startsWith('/confirm-email') ||
      this.router.url === '/not-found' ||
      this.router.url === '/resend-email' ||
      this.router.url.startsWith('/reset-password') ||
      this.router.url.startsWith('/register-with-third-party') ||
      this.router.url === '/forgot-password'
    );
  }
}
