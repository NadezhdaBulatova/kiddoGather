import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AccountService } from '../account.service';
import { Router, RouterModule } from '@angular/router';
import { CredentialResponse } from 'google-one-tap';
import { jwtDecode } from 'jwt-decode';
import { NgZone } from '@angular/core';

declare const FB: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  providers: [AccountService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  @ViewChild('googleButton') googleButton: ElementRef = new ElementRef({});
  form: FormGroup = new FormGroup({});
  submitted = false;
  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone
  ) {}
  repetitiveEmail = '';
  registrationCompleted = false;
  message = '';

  ngOnInit() {
    if (this.accountService.isAuthenticatedUser()) {
      this.router.navigateByUrl('/meet');
    }
    this.initializeForm();
    this.initializeGoogleButton();
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
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(15),
        ],
      ],
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
    this.accountService.register(this.form.value).subscribe({
      next: () => {
        this.form.reset();
        this.registrationCompleted = true;
        this.changeDetectorRef.detectChanges();
        setTimeout(() => this.router.navigateByUrl('/login'), 5000);
      },
      error: (error) => {
        if (
          error.error.message ===
          `Email ${
            this.form.get('email')?.value
          } already exists. Please try to use another email`
        ) {
          this.repetitiveEmail = this.form.get('email')?.value;
          this.changeDetectorRef.detectChanges();
        }
      },
    });
  }

  registerWithFacebook() {
    FB.login(async (FbResult: any) => {
      if (FbResult.authResponse) {
        const accessToken = FbResult.authResponse.accessToken;
        const userId = FbResult.authResponse.userID;
        this.router.navigateByUrl(
          `/register-with-third-party/facebook?access_token=${accessToken}&user_id=${userId}`
        );
      } else {
        console.log('Unable to register with Facebook');
      }
    });
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
    this.ngZone.run(() => {
      this.router.navigateByUrl(
        `/register-with-third-party/google?access_token=${response.credential}&user_id=${decodedToken.sub}`
      );
    });
  }
}
