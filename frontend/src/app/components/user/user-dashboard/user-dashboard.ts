import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { UserSideNav } from '../../../shared/components/user-side-nav/user-side-nav';
import { Api, BrowseItem, NotificationRecord } from '../../../core/services/api';

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule, RouterLink, UserSideNav],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboard implements OnInit {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly api = inject(Api);

  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'User',
  );
  protected readonly loading = signal(false);
  protected readonly items = signal<Array<BrowseItem & { itemType: 'lost' | 'found' }>>([]);
  protected readonly notifications = signal<NotificationRecord[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.api.getMyItems().subscribe({
      next: (res) => {
        this.items.set([
          ...res.lostItems.map((x) => ({ ...x, itemType: 'lost' as const })),
          ...res.foundItems.map((x) => ({ ...x, itemType: 'found' as const })),
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.api.getNotifications().subscribe({
      next: (records) => this.notifications.set(records),
      error: () => this.notifications.set([]),
    });
  }

  protected totalReports(): number {
    return this.items().length;
  }

  protected pendingReports(): number {
    return this.items().filter((x) => x.status === 'PENDING').length;
  }

  protected matchedItems(): number {
    return this.items().filter((x) => x.status === 'MATCHED').length;
  }

  protected completedItems(): number {
    return this.items().filter((x) => x.status === 'COMPLETED').length;
  }

  protected recentActivity(): Array<{ title: string; message: string; time: string }> {
    return this.notifications()
      .slice(0, 5)
      .map((n) => ({
        title: n.title,
        message: n.message,
        time: n.createdAt?.slice(0, 16).replace('T', ' ') ?? '',
      }));
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/home']);
  }
}
