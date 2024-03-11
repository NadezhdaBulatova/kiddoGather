import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterModel } from '../models/register.model';
import { LoginModel } from '../models/login.model';
import { environment } from '../../environments/environment.development';
import { User } from '../models/user.model';
import { from, map, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmEmail } from '../models/confirm-email.model';
import { ResetPasswordModel } from '../models/reset-password.model';
import { RegisterWithThirdPartyModel } from '../models/register-with-third-party.model';
import { LoginWithThirdPartyModel } from '../models/login-with-third-party';
import { PersonalInformationService } from './personal-information.service';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private isAuthenticated = false;
  user = JSON.parse(localStorage.getItem(environment.userKey) || '{}');
  userValue: any;
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private personalInformationService: PersonalInformationService
  ) {
    this.updateAuthenticationStatus();
  }

  updateAuthenticationStatus() {
    this.isAuthenticated = !!localStorage.getItem(environment.userKey);
  }

  register(model: RegisterModel) {
    return this.httpClient.post(
      `${environment.apiUrl}/account/register`,
      model
    );
  }
  login(model: LoginModel) {
    return this.httpClient
      .post<User>(`${environment.apiUrl}/account/login`, model)
      .pipe(
        switchMap((user: User) => {
          if (user) {
            return from(this.setUser(user));
          } else {
            return of(null);
          }
        })
      );
  }

  confirmEmail(params: ConfirmEmail) {
    return this.httpClient.put(
      `${environment.apiUrl}/account/confirm-email`,
      params
    );
  }

  requestPasswordReset(email: string) {
    return this.httpClient
      .post(`${environment.apiUrl}/account/forgot-credentials`, email)
      .pipe(map((res) => {}));
  }

  resetPassword(params: ResetPasswordModel) {
    return this.httpClient.put(
      `${environment.apiUrl}/account/reset-password`,
      params
    );
  }

  requestConfirmationEmail(email: string) {
    return this.httpClient
      .post(`${environment.apiUrl}/account/resend-confirm-email`, email)
      .pipe(map((res) => {}));
  }

  get jwt(): string | null {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user: User = JSON.parse(key);
      return user.jwt;
    } else {
      return null;
    }
  }
  isAuthenticatedUser(): boolean {
    return this.isAuthenticated;
  }

  refreshJWT() {
    return this.httpClient
      .get<User>(`${environment.apiUrl}/account/refresh-jwt`)
      .pipe(
        map((user: User) => {
          if (user) {
            this.setUser(user);
          }
        })
      );
  }

  registerWithThirdParty(model: RegisterWithThirdPartyModel) {
    return this.httpClient
      .post<User>(
        `${environment.apiUrl}/account/register-with-third-party`,
        model
      )
      .pipe(
        map((user: User) => {
          if (user) {
            this.setUser(user);
          }
        })
      );
  }

  loginWithThirdParty(model: LoginWithThirdPartyModel) {
    return this.httpClient
      .post<User>(`${environment.apiUrl}/account/login-with-third-party`, model)
      .pipe(
        switchMap((user: User) => {
          if (user) {
            return from(this.setUser(user));
          } else {
            return of(null);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem(environment.userKey);
    this.router.navigateByUrl('/login');
  }

  private async setUser(user: User) {
    return new Promise((resolve, reject) => {
      localStorage.setItem(
        environment.userKey,
        JSON.stringify({
          username: user.username,
          id: user.id,
          jwt: user.jwt,
        })
      );
      this.updateAuthenticationStatus();
      this.personalInformationService.findUser(user.id).subscribe({
        next: (res) => {
          this.personalInformationService.name.set(res.data.userById.name);
          this.personalInformationService.location.set(
            res.data.userById.location
          );
          if (res.data.userById.birthday) {
            this.personalInformationService.birthday.set(
              res.data.userById.birthday
            );
          }
          if (res.data.userById.image) {
            this.personalInformationService.profilePictureURL.set(
              `http://localhost:5206/${res.data.userById.image}`
            );
          }
          if (res.data.userById.locations) {
            this.personalInformationService.locations.set(
              res.data.userById.locations
            );
          }
          if (res.data.userById.kids) {
            this.personalInformationService.kids.set(res.data.userById.kids);
          }
          if (res.data.userById.languages) {
            this.personalInformationService.kids.set(
              res.data.userById.languages
            );
          }
          resolve(res.data.userById);
        },
        error: (err) => {
          if (err.graphQLErrors) {
            err.graphQLErrors.map(({ message }: { message: string }) => {
              if (message === 'User with id not found') {
                this.personalInformationService
                  .initialSetup(user.id, user.username)
                  .subscribe({
                    next: (response) => {
                      this.personalInformationService.name.set(
                        response.data.addUser.userMutationResult.name
                      );
                    },
                    error: () => {
                      console.log('error when creating');
                    },
                  });
              }
            });
          }
          reject(err);
        },
      });
    });
  }
}
