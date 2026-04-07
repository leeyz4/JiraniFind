import { Component, computed, inject } from '@angular/core';
import { UserSideNav } from '../../../shared/components/user-side-nav/user-side-nav';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-my-items',
  imports: [UserSideNav],
  templateUrl: './my-items.html',
  styleUrls: ['./my-items.css'],
})
export class MyItems {
  private readonly auth = inject(Auth);
  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'User',
  );
}
