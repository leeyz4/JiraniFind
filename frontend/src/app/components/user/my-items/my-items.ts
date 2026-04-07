import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserSideNav } from '../../../shared/components/user-side-nav/user-side-nav';
import { Auth } from '../../../core/services/auth';
import { Api, BrowseItem } from '../../../core/services/api';

@Component({
  selector: 'app-my-items',
  imports: [CommonModule, RouterLink, UserSideNav],
  templateUrl: './my-items.html',
  styleUrls: ['./my-items.css'],
})
export class MyItems implements OnInit {
  private readonly auth = inject(Auth);
  private readonly api = inject(Api);
  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'User',
  );

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly filterType = signal<'all' | 'lost' | 'found'>('all');
  protected readonly searchTerm = signal('');
  protected readonly items = signal<Array<BrowseItem & { itemType: 'lost' | 'found' }>>([]);

  ngOnInit(): void {
    this.loadMyItems();
  }

  protected loadMyItems(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.api.getMyItems().subscribe({
      next: (res) => {
        this.loading.set(false);
        this.items.set([
          ...res.lostItems.map((item) => ({ ...item, itemType: 'lost' as const })),
          ...res.foundItems.map((item) => ({ ...item, itemType: 'found' as const })),
        ]);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Could not load your reports.');
      },
    });
  }

  protected setFilterType(type: 'all' | 'lost' | 'found'): void {
    this.filterType.set(type);
  }

  protected filteredItems(): Array<BrowseItem & { itemType: 'lost' | 'found' }> {
    const type = this.filterType();
    const q = this.searchTerm().trim().toLowerCase();
    return this.items().filter((item) => {
      if (type !== 'all' && item.itemType !== type) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q)
      );
    });
  }

  protected setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  protected totalReports(): number {
    return this.items().length;
  }

  protected awaitingApprovalCount(): number {
    return this.items().filter((x) => x.status === 'PENDING').length;
  }

  protected resolvedCount(): number {
    return this.items().filter((x) => x.status === 'MATCHED' || x.status === 'COMPLETED').length;
  }

  protected itemBadgeClass(item: BrowseItem & { itemType: 'lost' | 'found' }): string {
    if (item.itemType === 'lost' && item.status === 'MATCHED') {
      return 'lost-matched';
    }
    if (item.itemType === 'found' && item.status === 'APPROVED') {
      return 'found-approved';
    }
    return item.itemType === 'lost' ? 'lost-matched' : 'found-approved';
  }

  protected itemBadgeLabel(item: BrowseItem & { itemType: 'lost' | 'found' }): string {
    return `${item.itemType.toUpperCase()} • ${item.status}`;
  }
}
