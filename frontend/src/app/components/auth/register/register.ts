import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

function passwordsMatch(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password')?.value as string | undefined;
  const confirm = control.get('confirmPassword')?.value as string | undefined;
  if (!password || !confirm || password === confirm) {
    return null;
  }
  return { mismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected errorMessage = '';
  protected submitting = false;

  protected readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      city: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, Validators.requiredTrue],
    },
    { validators: [passwordsMatch] },
  );

  protected submit(): void {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.form.getRawValue();
    this.submitting = true;
    this.auth.register({ name, email, password }).subscribe({
      next: () => {
        this.submitting = false;
        void this.router.navigate(['/verify'], {
          queryParams: { email },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const msg = err.error?.message;
        const text = Array.isArray(msg) ? msg.join(' ') : msg;
        this.errorMessage =
          typeof text === 'string' ? text : 'Registration failed';
      },
    });
  }
}
