import { Component, computed, inject } from '@angular/core';
import { UserSideNav } from '../../../shared/components/user-side-nav/user-side-nav';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-profile',
  imports: [UserSideNav],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile {
  private readonly auth = inject(Auth);
  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'User',
  );
  protected readonly userEmail = computed(
    () => this.auth.currentUser()?.email ?? '',
  );
}
