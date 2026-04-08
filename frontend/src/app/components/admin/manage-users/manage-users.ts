import { Component, computed, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSideNav } from '../../../shared/components/admin-side-nav/admin-side-nav';
import { Api, AdminUserRecord } from '../../../core/services/api';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-manage-users',
  imports: [CommonModule, FormsModule, AdminSideNav],
  templateUrl: './manage-users.html',
  styleUrls: ['./manage-users.css'],
})
export class ManageUsers implements OnInit {
  private readonly api = inject(Api);
  private readonly auth = inject(Auth);

  protected readonly currentUserId = computed(
    () => this.auth.currentUser()?.id ?? '',
  );

  protected readonly loading = signal(false);
  protected readonly users = signal<AdminUserRecord[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly roleFilter = signal<'ALL' | 'USER' | 'ADMIN'>('ALL');
  protected readonly statusFilter = signal<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');

  protected readonly editTarget = signal<AdminUserRecord | null>(null);
  protected readonly editName = signal('');
  protected readonly editRole = signal<'USER' | 'ADMIN'>('USER');
  protected readonly editVerified = signal(false);
  protected readonly actionBusy = signal(false);
  protected readonly actionError = signal('');

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

  protected openEdit(user: AdminUserRecord): void {
    this.actionError.set('');
    this.editTarget.set(user);
    this.editName.set(user.name);
    this.editRole.set(user.role);
    this.editVerified.set(user.isVerified);
  }

  protected closeEdit(): void {
    this.editTarget.set(null);
    this.actionError.set('');
  }

  protected saveEdit(): void {
    const user = this.editTarget();
    if (!user || this.actionBusy()) return;
    const name = this.editName().trim();
    if (!name) {
      this.actionError.set('Name is required.');
      return;
    }
    this.actionBusy.set(true);
    this.actionError.set('');
    this.api
      .updateAdminUser(user.id, {
        name,
        role: this.editRole(),
        isVerified: this.editVerified(),
      })
      .subscribe({
        next: (updated) => {
          this.actionBusy.set(false);
          this.users.set(
            this.users().map((u) => (u.id === updated.id ? updated : u)),
          );
          this.closeEdit();
        },
        error: () => {
          this.actionBusy.set(false);
          this.actionError.set('Could not update user.');
        },
      });
  }

  protected confirmDelete(user: AdminUserRecord): void {
    if (user.id === this.currentUserId()) {
      return;
    }
    if (!globalThis.confirm(`Delete ${user.name}? This cannot be undone.`)) {
      return;
    }
    this.actionError.set('');
    this.api.deleteAdminUser(user.id).subscribe({
      next: () => {
        this.users.set(this.users().filter((u) => u.id !== user.id));
      },
      error: () => this.actionError.set('Could not delete user.'),
    });
  }
}
