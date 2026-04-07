import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSideNav } from '../../../shared/components/admin-side-nav/admin-side-nav';
import { Auth } from '../../../core/services/auth';
import { Api, AdminItemRecord } from '../../../core/services/api';

@Component({
  selector: 'app-pending-items',
  imports: [CommonModule, AdminSideNav],
  templateUrl: './pending-items.html',
  styleUrls: ['./pending-items.css'],
})
export class PendingItems implements OnInit {
  private readonly auth = inject(Auth);
  private readonly api = inject(Api);
  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'Admin',
  );

  protected readonly loading = signal(false);
  protected readonly actionLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly searchTerm = signal('');
  protected readonly items = signal<Array<AdminItemRecord & { itemType: 'lost' | 'found' }>>([]);
  protected readonly selectedId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPendingItems();
  }

  protected loadPendingItems(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.api.getPendingItems().subscribe({
      next: (res) => {
        this.loading.set(false);
        const all = [
          ...res.lostItems.map((x) => ({ ...x, itemType: 'lost' as const })),
          ...res.foundItems.map((x) => ({ ...x, itemType: 'found' as const })),
        ];
        this.items.set(all);
        if (!this.selectedId() && all.length > 0) {
          this.selectedId.set(all[0].id);
        }
        if (all.length === 0) {
          this.selectedId.set(null);
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Could not load pending items.');
      },
    });
  }

  protected setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  protected filteredItems(): Array<AdminItemRecord & { itemType: 'lost' | 'found' }> {
    const q = this.searchTerm().trim().toLowerCase();
    if (!q) {
      return this.items();
    }
    return this.items().filter((item) => {
      const reporter = item.user?.name ?? '';
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        reporter.toLowerCase().includes(q)
      );
    });
  }

  protected selectItem(id: string): void {
    this.selectedId.set(id);
  }

  protected selectedItem():
    | (AdminItemRecord & { itemType: 'lost' | 'found' })
    | null {
    const id = this.selectedId();
    if (!id) return null;
    return this.items().find((x) => x.id === id) ?? null;
  }

  protected approve(id: string): void {
    this.updateStatus(id, 'APPROVED');
  }

  protected reject(id: string): void {
    this.updateStatus(id, 'REJECTED');
  }

  private updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): void {
    this.actionLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.api.updateItemStatus(id, status).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.successMessage.set(
          `Item ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`,
        );
        this.items.set(this.items().filter((x) => x.id !== id));
        if (this.selectedId() === id) {
          this.selectedId.set(this.items()[0]?.id ?? null);
        }
      },
      error: () => {
        this.actionLoading.set(false);
        this.errorMessage.set('Failed to update item status.');
      },
    });
  }
}
