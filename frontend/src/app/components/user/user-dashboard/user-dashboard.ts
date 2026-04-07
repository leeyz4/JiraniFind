import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { UserSideNav } from '../../../shared/components/user-side-nav/user-side-nav';

@Component({
  selector: 'app-user-dashboard',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboard {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'User',
  );

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/home']);
  }
}
