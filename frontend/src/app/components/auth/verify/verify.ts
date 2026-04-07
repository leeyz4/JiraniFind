import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  computed,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-verify',
  imports: [RouterLink],
  templateUrl: './verify.html',
  styleUrls: ['./verify.css'],
})
export class Verify implements OnInit, OnDestroy {
  private readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly digits = signal<string[]>(['', '', '', '', '', '']);
  protected errorMessage = '';
  protected submitting = false;
  protected resendSubmitting = false;
  protected resendSeconds = signal(0);

  protected readonly maskedEmail = computed(() => {
    const e = this.email();
    if (!e) {
      return 'your email';
    }
    const [local, domain] = e.split('@');
    if (!domain || !local) {
      return e;
    }
    return `${local.slice(0, 1)}***@${domain}`;
  });

  private timerId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.email.set(params.get('email') ?? '');
    });
    this.startResendCooldown(60);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  protected onDigitInput(ev: Event, index: number): void {
    const input = ev.target as HTMLInputElement;
    const v = input.value.replace(/\D/g, '').slice(-1);
    input.value = v;
    const next = [...this.digits()];
    next[index] = v;
    this.digits.set(next);
    if (v && index < 5) {
      document.getElementById(`verify-digit-${index + 1}`)?.focus();
    }
  }

  protected onKeydown(ev: KeyboardEvent, index: number): void {
    const input = ev.target as HTMLInputElement;
    if (ev.key === 'Backspace' && !input.value && index > 0) {
      document.getElementById(`verify-digit-${index - 1}`)?.focus();
    }
  }

  protected onPaste(ev: ClipboardEvent, startIndex: number): void {
    ev.preventDefault();
    const text = ev.clipboardData?.getData('text')?.replace(/\D/g, '') ?? '';
    if (!text) {
      return;
    }
    const next = [...this.digits()];
    for (let i = 0; i < 6 - startIndex && i < text.length; i++) {
      next[startIndex + i] = text[i] ?? '';
    }
    this.digits.set(next);
    const focusIndex = Math.min(startIndex + text.length, 5);
    document.getElementById(`verify-digit-${focusIndex}`)?.focus();
    for (let i = 0; i < 6; i++) {
      const el = document.getElementById(
        `verify-digit-${i}`,
      ) as HTMLInputElement | null;
      if (el) {
        el.value = next[i] ?? '';
      }
    }
  }

  protected submit(): void {
    this.errorMessage = '';
    const code = this.digits().join('');
    const emailVal = this.email();
    if (!emailVal) {
      this.errorMessage =
        'Missing email. Go back to registration and try again, or add your email to the URL.';
      return;
    }
    if (code.length !== 6) {
      this.errorMessage = 'Enter the full 6-digit code.';
      return;
    }
    this.submitting = true;
    this.auth.verifyEmail(emailVal, code).subscribe({
      next: () => {
        this.submitting = false;
        void this.router.navigate(['/login'], {
          queryParams: { verified: '1' },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const msg = err.error?.message;
        const text = Array.isArray(msg) ? msg[0] : msg;
        this.errorMessage =
          typeof text === 'string' ? text : 'Verification failed';
      },
    });
  }

  protected resend(): void {
    this.errorMessage = '';
    const emailVal = this.email();
    if (!emailVal || this.resendSeconds() > 0) {
      return;
    }
    this.resendSubmitting = true;
    this.auth.resendVerification(emailVal).subscribe({
      next: () => {
        this.resendSubmitting = false;
        this.startResendCooldown(60);
      },
      error: () => {
        this.resendSubmitting = false;
        this.errorMessage = 'Could not resend the code. Try again shortly.';
      },
    });
  }

  private startResendCooldown(seconds: number): void {
    this.clearTimer();
    this.resendSeconds.set(seconds);
    this.timerId = setInterval(() => {
      const s = this.resendSeconds();
      if (s <= 1) {
        this.resendSeconds.set(0);
        this.clearTimer();
        return;
      }
      this.resendSeconds.set(s - 1);
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
