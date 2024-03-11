import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from './account/account.service';
import { inject } from '@angular/core';

export const AuthorizationGuard: CanActivateFn = (route, state) => {
  return checkAuth();
};

const checkAuth = (): boolean => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  if (accountService.isAuthenticatedUser()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
