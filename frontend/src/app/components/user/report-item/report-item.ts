import { Component, computed, inject } from '@angular/core';
import { UserSideNav } from '../../../shared/components/user-side-nav/user-side-nav';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-report-item',
  imports: [UserSideNav],
  templateUrl: './report-item.html',
  styleUrls: ['./report-item.css'],
})
export class ReportItem {
  private readonly auth = inject(Auth);
  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'User',
  );
}
