import { Component, computed, inject } from '@angular/core';
import { UserSideNav } from '../../../shared/components/user-side-nav/user-side-nav';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-browse-items',
  imports: [UserSideNav],
  templateUrl: './browse-items.html',
  styleUrls: ['./browse-items.css'],
})
export class BrowseItems {
  private readonly auth = inject(Auth);
  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'User',
  );
}
