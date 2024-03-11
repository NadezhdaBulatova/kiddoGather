import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../account.service';
import { ConfirmEmail } from '../../models/confirm-email.model';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css',
})
export class ConfirmEmailComponent implements OnInit {
  constructor(
    private router: Router,
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}
  message = '';
  redirect = '';
  emailDoesNotExist = '';

  ngOnInit() {
    if (!this.accountService.isAuthenticatedUser()) {
      this.activatedRoute.queryParamMap.subscribe({
        next: (params: any) => {
          const confirmEmailDetails: ConfirmEmail = {
            token: params.get('token'),
            email: params.get('email'),
          };
          this.accountService.confirmEmail(confirmEmailDetails).subscribe({
            next: (res: any) => {
              this.message =
                'Email was successfully confirmed. Please wait, you will be redirected to the login page';
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
        },
      });
    } else {
      this.router.navigateByUrl('/meet');
    }
  }

  handleError(error: any) {
    const errorMessage = error.error.value.message;
    switch (errorMessage) {
      case 'User with specified email does not exist':
        this.message = `User with specified email does not exist. Please wait, you will be redirected to the registration page`;
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
        this.router.navigateByUrl('/resend-email');
    }
  }
}
