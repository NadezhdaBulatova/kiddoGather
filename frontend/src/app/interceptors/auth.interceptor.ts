import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
} from '@angular/common/http';
import { AccountService } from '../account/account.service';
import { EMPTY } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const excludedRoutes = [
    `${environment.apiUrl}/account/login`,
    `${environment.apiUrl}/account/register`,
    `${environment.apiUrl}/account/confirm-email`,
  ];
  const authService = inject(AccountService);
  const router = inject(Router);
  const authToken = authService.jwt;
  const currentPath = router.url.split('?')[0];

  if (authToken && !excludedRoutes.includes(currentPath)) {
    if (isTokenExpired(authToken)) {
      authService.logout();
      return EMPTY;
    }
    if (
      isTokenIsAboutToExpire(authToken) &&
      !req.url.includes(`${environment.apiUrl}/account/refresh-jwt`)
    ) {
      authService.refreshJWT().subscribe({
        next: () => {},
        error: () => {},
      });
      return EMPTY;
    }
    const authReq = req.clone({
      setHeaders: { Authorization: 'Bearer ' + authToken },
    });
    return next(authReq);
  }
  return next(req);
};

const isTokenExpired = (token: string): boolean => {
  const currentTime = Date.now();
  return currentTime > getTokenExpiration(token);
};

const isTokenIsAboutToExpire = (token: string): boolean => {
  const currentTime = Date.now();
  const datesDiff = Math.abs(getTokenExpiration(token) - currentTime);
  return datesDiff < 12 * 60 * 60 * 1000;
};

const getTokenExpiration = (token: string): number => {
  const base64Url: string = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
  const payload = JSON.parse(jsonPayload);
  return payload.exp * 1000;
};

//const authProtectedCalls
