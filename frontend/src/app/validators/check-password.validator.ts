import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const CheckPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmNewPassword = control.get('confirmNewPassword');

  return newPassword &&
    confirmNewPassword &&
    newPassword.value === confirmNewPassword.value
    ? null
    : { passwordsNotMatching: true };
};
