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
  selector: 'app-resend-email',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './resend-email.component.html',
  styleUrl: './resend-email.component.css',
})
export class ResendEmailComponent {
  constructor(
    private router: Router,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) {}
  message = 'Please use the form below to resend confirmation email';
  redirect = '';
  requestSend = false;
  form: FormGroup = new FormGroup({});
  emailDoesNotExist = '';

  ngOnInit() {
    if (!this.accountService.isAuthenticatedUser()) {
      this.initializeForm();
    } else {
      this.router.navigateByUrl('/meet');
    }
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
      case 'Email is already confirmed':
        this.message = `Email is already confirmed. Please wait, you will be redirected to the login page`;
        this.redirect = '/login';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 5000);
        break;
      default:
        this.message = `We are experiencing problems with confirmation email requests. Please try again later`;
        this.redirect = '';
        this.cdr.detectChanges();
        break;
    }
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    this.requestSend = true;
    this.accountService.requestConfirmationEmail(this.form.value).subscribe({
      next: (response) => {
        this.message =
          'Confirmation email was successfully requested, please check your email. Wait to be automatically redirected to the login page';
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

  onCancel() {
    this.router.navigateByUrl('/login');
  }
}
