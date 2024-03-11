import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../account.service';
import { RegisterWithThirdPartyModel } from '../../models/register-with-third-party.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-register-with-third-party',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-with-third-party.component.html',
  styleUrl: './register-with-third-party.component.css',
})
export class RegisterWithThirdPartyComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  submitted = false;
  provider: string | null = null;
  accessToken: string | null = null;
  userId: string | null = null;
  message = '';
  redirect = '';

  constructor(
    private accountService: AccountService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit() {
    console.log(this.submitted);
    if (this.accountService.isAuthenticatedUser()) {
      this.router.navigateByUrl('/meet');
    }
    this.activatedRoute.queryParamMap.subscribe({
      next: (params: any) => {
        this.provider = this.activatedRoute.snapshot.paramMap.get('provider');
        this.accessToken = params.get('access_token');
        this.userId = params.get('user_id');

        if (
          (this.provider &&
            this.accessToken &&
            this.userId &&
            this.provider === 'facebook') ||
          this.provider === 'google'
        ) {
          this.initializeForm();
        } else {
          this.router.navigateByUrl('/register');
        }
      },
      error: () => {},
    });
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      nickname: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ],
      ],
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.userId && this.accessToken && this.provider) {
      const nickname = this.form.get('nickname')?.value;
      const model = new RegisterWithThirdPartyModel(
        nickname,
        this.userId,
        this.accessToken,
        this.provider
      );
      this.accountService.registerWithThirdParty(model).subscribe({
        next: (_) => {
          this.message = `Registration with ${this.provider} was successful. Wait to be redirected to the main page`;
          this.redirect = '/meet';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigateByUrl('/meet');
          }, 5000);
        },
        error: (_) => {
          this.message = `There was an issue with ${this.provider} registration. Please try again or use different registration method. Wait to be redirected to the registration page`;
          this.redirect = '/register';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigateByUrl('/register');
          }, 5000);
        },
      });
    }
  }
}
