import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected errorMessage = '';
  protected submitting = false;
  protected verifiedBanner = false;

  ngOnInit(): void {
    this.verifiedBanner =
      this.route.snapshot.queryParamMap.get('verified') === '1';
  }

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected submit(): void {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.submitting = true;
    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.submitting = false;
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ??
          this.auth.postLoginPath();
        const path = returnUrl.startsWith('/') ? returnUrl : `/${returnUrl}`;
        void this.router.navigateByUrl(path);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const msg = err.error?.message;
        const text = Array.isArray(msg) ? msg[0] : msg ?? 'Sign in failed';
        if (
          err.status === 401 &&
          typeof text === 'string' &&
          text.toLowerCase().includes('verify')
        ) {
          void this.router.navigate(['/verify'], {
            queryParams: { email },
          });
          return;
        }
        this.errorMessage = typeof text === 'string' ? text : 'Sign in failed';
      },
    });
  }
}
