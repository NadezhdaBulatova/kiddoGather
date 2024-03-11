import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AccountService } from '../account.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoginWithThirdPartyModel } from '../../models/login-with-third-party';
import { CredentialResponse } from 'google-one-tap';
import { jwtDecode } from 'jwt-decode';

declare const FB: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  providers: [AccountService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  @ViewChild('googleButton') googleButton: ElementRef = new ElementRef({});
  form: FormGroup = new FormGroup({});
  submitted = false;
  emailDoesNotExist = '';
  invalidPassword = '';
  confirmEmail = false;
  loginCompleted = false;
  message = '';
  provider = '';

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    if (this.accountService.isAuthenticatedUser()) {
      this.router.navigateByUrl('/meet');
    }
    this.initializeForm();
    this.initializeGoogleButton();
  }
  initializeForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  ngAfterViewInit() {
    this.googleButton.nativeElement.addEventListener('click', () => {
      //@ts-ignore
      google.accounts.id.prompt();
    });
  }

  onSubmit() {
    this.submitted = true;
    this.accountService.login(this.form.value).subscribe({
      next: (response) => {
        this.form.reset();
        this.loginCompleted = true;
        this.cdr.detectChanges();
        this.router.navigateByUrl('/meet');
      },
      error: (error) => {
        if (
          error.error.value.message ===
          'User with specified email does not exist'
        ) {
          this.emailDoesNotExist = this.form.get('email')?.value;
          this.cdr.detectChanges();
        }
        if (
          error.error.value.message === 'Invalid password for specified email'
        ) {
          this.invalidPassword = this.form.get('password')?.value;
          this.cdr.detectChanges();
        }
        if (error.error.value.message === 'Please confirm your email') {
          this.confirmEmail = true;
          this.cdr.detectChanges();
        }
      },
    });
  }

  resetPassword() {
    this.router.navigateByUrl('/forgot-password');
  }

  loginWithFacebook() {
    this.message = '';
    this.provider = 'facebook';
    FB.login(async (FbResult: any) => {
      if (FbResult.authResponse) {
        const accessToken = FbResult.authResponse.accessToken;
        const userId = FbResult.authResponse.userID;
        this.accountService
          .loginWithThirdParty(
            new LoginWithThirdPartyModel(userId, accessToken, this.provider)
          )
          .subscribe({
            next: () => {
              this.router.navigateByUrl('/meet');
            },
            error: () => {
              this.message = `There was an issue with ${this.provider} login. Please try again or use different login method`;
              this.cdr.detectChanges();
            },
          });
      } else {
        console.log('Unable to log in with Facebook');
      }
    });
  }

  removeMessage() {
    this.message = '';
  }

  private initializeGoogleButton() {
    (window as any).onGoogleLibraryLoad = () => {
      //@ts-ignore
      google.accounts.id.initialize({
        client_id:
          '311835184849-f4s9jvb8flbd8qd7lmjf6a9rn0c4ppq2.apps.googleusercontent.com',
        callback: this.googleCallBack.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    };
  }

  private async googleCallBack(response: CredentialResponse) {
    const decodedToken: any = jwtDecode(response.credential);
    this.accountService
      .loginWithThirdParty(
        new LoginWithThirdPartyModel(
          decodedToken.sub,
          response.credential,
          'google'
        )
      )
      .subscribe({
        next: () => {
          window.location.href = '/meet';
        },
        error: () => {
          this.ngZone.run(() => {
            this.message = `There was an issue with ${this.provider} login. Please try again or use different login method`;
            this.cdr.detectChanges();
          });
        },
      });
  }
}
