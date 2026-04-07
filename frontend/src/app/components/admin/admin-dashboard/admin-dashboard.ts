import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'Admin',
  );

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/home']);
  }
}
