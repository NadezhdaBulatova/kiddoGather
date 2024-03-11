import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ResetPasswordModel } from '../../models/reset-password.model';
import { CheckPasswordDirective } from '../../directives/check-passwords.directive';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    CheckPasswordDirective,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  private email = '';
  private token = '';
  submitted = false;
  redirect = '';
  message = 'Please enter the new password in the form below';
  form: FormGroup = new FormGroup({});
  emailDoesNotExist = '';
  invalidPassword = '';

  constructor(
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    if (!this.accountService.isAuthenticatedUser()) {
      this.activatedRoute.queryParamMap.subscribe({
        next: (params: any) => {
          this.token = params.get('token');
          this.email = params.get('email');
          this.initializeForm();
        },
      });
    } else {
      this.router.navigateByUrl('/meet');
    }
  }

  onSubmit() {
    this.submitted = true;
    const resetPasswordReq: ResetPasswordModel = {
      email: this.email,
      token: this.token,
      newPassword: this.form.get('newPassword')?.value,
    };
    this.accountService.resetPassword(resetPasswordReq).subscribe({
      next: (res: any) => {
        this.message =
          'Password was successfully reset. Please wait, you will be redirected to the login page';
        this.redirect = '/login';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 5000);
      },
      error: (err) => {
        this.handleError(err);
      },
    });
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(15),
        ],
      ],
      confirmNewPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(15),
        ],
      ],
    });
  }

  onCancel() {
    this.router.navigateByUrl('/login');
  }

  handleError(error: any) {
    const errorMessage = error.error.value.message;
    switch (errorMessage) {
      case 'Please confirm your email first':
        this.message = `Email was not confirmed. Please check your email`;
        this.redirect = '/resend-email';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigateByUrl('/resend-email');
        }, 5000);
        break;
      default:
        this.message = `There was an issue with resetting your password. Please try again later. You will be automatically redirected to the login page`;
        this.redirect = '/login';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 5000);
    }
  }
}
