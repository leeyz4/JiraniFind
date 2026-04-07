import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { Api, AdminClaimRecord, AdminItemRecord } from '../../../core/services/api';
import { AdminSideNav } from '../../../shared/components/admin-side-nav/admin-side-nav';


@Component({
  selector: 'app-manage-claims',
  imports: [AdminSideNav],
  templateUrl: './manage-claims.html',
  styleUrls: ['./manage-claims.css'],
})
export class ManageClaims implements OnInit {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly api = inject(Api);

  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'Admin',
  );
  protected readonly loading = signal(false);
  protected readonly actionLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly selectedStatus = signal<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  protected readonly claims = signal<AdminClaimRecord[]>([]);
  protected readonly selectedClaimId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadClaims();
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/home']);
  }

  protected loadClaims(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    const selected = this.selectedStatus();
    const status: 'PENDING' | 'APPROVED' | 'REJECTED' | undefined =
      selected === 'ALL' ? undefined : selected;
    this.api.getAdminClaims(status).subscribe({
      next: (claims) => {
        this.loading.set(false);
        this.claims.set(claims);
        if (!this.selectedClaimId() && claims.length > 0) {
          this.selectedClaimId.set(claims[0].id);
        }
        if (claims.length === 0) {
          this.selectedClaimId.set(null);
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Could not load claims.');
      },
    });
  }

  protected setStatusTab(status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'): void {
    this.selectedStatus.set(status);
    this.loadClaims();
  }

  protected selectClaim(id: string): void {
    this.selectedClaimId.set(id);
  }

  protected selectedClaim(): AdminClaimRecord | null {
    const id = this.selectedClaimId();
    if (!id) return null;
    return this.claims().find((c) => c.id === id) ?? null;
  }

  protected claimItem(claim: AdminClaimRecord): AdminItemRecord | null {
    return claim.lostItem ?? claim.foundItem ?? null;
  }

  protected claimItemRef(claim: AdminClaimRecord): string {
    return claim.lostItemId ?? claim.foundItemId ?? 'Unknown item';
  }

  protected statusBadge(status: AdminClaimRecord['status']): string {
    if (status === 'APPROVED') return 'Verified';
    if (status === 'REJECTED') return 'Rejected';
    return 'Awaiting Review';
  }

  protected approveClaim(id: string): void {
    this.updateClaim(id, 'APPROVED');
  }

  protected rejectClaim(id: string): void {
    this.updateClaim(id, 'REJECTED');
  }

  private updateClaim(id: string, status: 'APPROVED' | 'REJECTED'): void {
    this.actionLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.api.updateClaimStatus(id, status).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.successMessage.set(
          `Claim ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`,
        );
        this.claims.set(this.claims().filter((c) => c.id !== id));
        if (this.selectedClaimId() === id) {
          this.selectedClaimId.set(this.claims()[0]?.id ?? null);
        }
      },
      error: () => {
        this.actionLoading.set(false);
        this.errorMessage.set('Failed to update claim status.');
      },
    });
  }
}
