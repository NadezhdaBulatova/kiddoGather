import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../account.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  constructor(
    private router: Router,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) {}
  message = 'Please use the form below to request password reset';
  redirect = '';
  requestSent = false;
  form: FormGroup = new FormGroup({});
  emailDoesNotExist = '';

  ngOnInit() {
    if (!this.accountService.isAuthenticatedUser()) {
      this.initializeForm();
    } else {
      this.router.navigateByUrl('/meet');
    }
  }

  onSubmit() {
    this.requestSent = true;
    this.accountService.requestPasswordReset(this.form.value).subscribe({
      next: (response) => {
        this.message =
          'Password reset was successfully requested, please check your email. Wait to be automatically redirected to the login page';
        this.redirect = '/login';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 5000);
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  handleError(error: any) {
    const errorMessage = error.error.value.message;
    switch (errorMessage) {
      case 'User with specified email does not exist':
        this.message = `User with specified email does not exist. Please wait to be redirected to the registration page`;
        this.redirect = '/register';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigateByUrl('/register');
        }, 5000);
        break;
      case 'Please confirm your email first':
        this.message = `You need to confirm your email first. Check your email`;
        this.redirect = '/resend-email';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 5000);
        break;
      default:
        this.message = `We are experiencing problems with password reset requests. Please try again later`;
        this.redirect = 'login';
        this.cdr.detectChanges();
        break;
    }
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onCancel() {
    this.router.navigateByUrl('/login');
  }
}
