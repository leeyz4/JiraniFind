import { Component, computed, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../../core/services/api';
import { UserSideNav } from '../../../shared/components/user-side-nav/user-side-nav';
import { Auth } from '../../../core/services/auth';
import { UiToast } from '../../../core/services/ui-toast';

@Component({
  selector: 'app-report-item',
  imports: [UserSideNav, ReactiveFormsModule],
  templateUrl: './report-item.html',
  styleUrls: ['./report-item.css'],
})
export class ReportItem {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly uiToast = inject(UiToast);

  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'User',
  );

  protected selectedType: 'lost' | 'found' = 'lost';
  protected submitting = false;
  protected successMessage = '';
  protected errorMessage = '';
  protected selectedFileName = '';
  protected imageDataUrl = '';

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    category: ['Electronics', [Validators.required]],
    keywords: [''],
    description: ['', [Validators.required, Validators.minLength(10)]],
    location: ['', [Validators.required, Validators.minLength(2)]],
    dateLost: ['', [Validators.required]],
  });

  protected setType(type: 'lost' | 'found'): void {
    this.selectedType = type;
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFileName = '';
    this.imageDataUrl = '';
    if (!file) return;
    this.selectedFileName = file.name;
    this.imageDataUrl = await this.fileToDataUrl(file);
  }

  protected submit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.submitting = true;
    const descriptionWithKeywords = value.keywords.trim()
      ? `${value.description}\nKeywords: ${value.keywords}`
      : value.description;
    this.api
      .reportItem({
        title: value.title,
        category: value.category,
        description: descriptionWithKeywords,
        location: value.location,
        dateLost: new Date(value.dateLost).toISOString(),
        imageUrl: this.imageDataUrl || undefined,
        type: this.selectedType,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage =
            'Report submitted. It will be published after admin approval.';
          this.uiToast.show(
            'Report submitted. Awaiting admin approval.',
            'success',
          );
          this.form.reset({
            title: '',
            category: 'Electronics',
            keywords: '',
            description: '',
            location: '',
            dateLost: '',
          });
          this.selectedType = 'lost';
          this.selectedFileName = '';
          this.imageDataUrl = '';
          setTimeout(() => {
            void this.router.navigate(['/my-items']);
          }, 700);
        },
        error: (error: { error?: { message?: string | string[] } }) => {
          this.submitting = false;
          const msg = error.error?.message;
          this.errorMessage = Array.isArray(msg)
            ? msg.join(', ')
            : (msg ?? 'Failed to submit report');
          this.uiToast.show(this.errorMessage, 'error');
        },
      });
  }

  private async fileToDataUrl(file: File): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Could not read selected file'));
      reader.readAsDataURL(file);
    });
  }
}
