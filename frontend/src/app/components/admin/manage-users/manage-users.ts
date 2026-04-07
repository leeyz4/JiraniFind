import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSideNav } from '../../../shared/components/admin-side-nav/admin-side-nav';
import { Api, AdminUserRecord } from '../../../core/services/api';

@Component({
  selector: 'app-manage-users',
  imports: [CommonModule, AdminSideNav],
  templateUrl: './manage-users.html',
  styleUrls: ['./manage-users.css'],
})
export class ManageUsers implements OnInit {
  private readonly api = inject(Api);

  protected readonly loading = signal(false);
  protected readonly users = signal<AdminUserRecord[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly roleFilter = signal<'ALL' | 'USER' | 'ADMIN'>('ALL');
  protected readonly statusFilter = signal<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');

  ngOnInit(): void {
    this.loadUsers();
  }

  protected loadUsers(): void {
    this.loading.set(true);
    this.api.getAdminUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.users.set([]);
        this.loading.set(false);
      },
    });
  }

  protected setSearch(value: string): void {
    this.searchTerm.set(value);
  }

  protected setRole(value: 'ALL' | 'USER' | 'ADMIN'): void {
    this.roleFilter.set(value);
  }

  protected setStatus(value: 'ALL' | 'VERIFIED' | 'UNVERIFIED'): void {
    this.statusFilter.set(value);
  }

  protected filteredUsers(): AdminUserRecord[] {
    const q = this.searchTerm().trim().toLowerCase();
    return this.users().filter((user) => {
      if (this.roleFilter() !== 'ALL' && user.role !== this.roleFilter()) {
        return false;
      }
      if (
        this.statusFilter() === 'VERIFIED' &&
        !user.isVerified
      ) {
        return false;
      }
      if (
        this.statusFilter() === 'UNVERIFIED' &&
        user.isVerified
      ) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
      );
    });
  }

  protected adminCount(): number {
    return this.users().filter((u) => u.role === 'ADMIN').length;
  }
}
