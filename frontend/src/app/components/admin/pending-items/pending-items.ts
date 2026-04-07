import { Component, computed, inject } from '@angular/core';
import { AdminSideNav } from '../../../shared/components/admin-side-nav/admin-side-nav';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-pending-items',
  imports: [AdminSideNav],
  templateUrl: './pending-items.html',
  styleUrls: ['./pending-items.css'],
})
export class PendingItems {
  private readonly auth = inject(Auth);
  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'Admin',
  );
}
