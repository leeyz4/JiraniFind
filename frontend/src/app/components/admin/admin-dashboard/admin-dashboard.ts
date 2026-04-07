import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { AdminSideNav } from '../../../shared/components/admin-side-nav/admin-side-nav';
import { AdminDashboardResponse, Api } from '../../../core/services/api';


@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink, AdminSideNav],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly api = inject(Api);

  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'Admin',
  );
  protected readonly dashboard = signal<AdminDashboardResponse | null>(null);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    this.loading.set(true);
    this.api.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.dashboard.set(null);
        this.loading.set(false);
      },
    });
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/home']);
  }
}
