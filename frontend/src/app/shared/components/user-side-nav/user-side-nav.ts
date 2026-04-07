import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-user-side-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './user-side-nav.html',
  styleUrl: './user-side-nav.css',
})
export class UserSideNav {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/home']);
  }
}
