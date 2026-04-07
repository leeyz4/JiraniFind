import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-side-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-side-nav.html',
  styleUrl: './admin-side-nav.css',
})
export class AdminSideNav {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/home']);
  }
}
