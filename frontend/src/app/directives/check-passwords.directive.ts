import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { CheckPasswordValidator } from '../validators/check-password.validator';
import { Directive } from '@angular/core';

@Directive({
  selector: '[checkPassword]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: CheckPasswordDirective,
      multi: true,
    },
  ],
  standalone: true,
})
export class CheckPasswordDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return CheckPasswordValidator(control);
  }
}
