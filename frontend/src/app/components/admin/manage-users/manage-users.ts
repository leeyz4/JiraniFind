import { Component } from '@angular/core';
import { AdminSideNav } from '../../../shared/components/admin-side-nav/admin-side-nav';

@Component({
  selector: 'app-manage-users',
  imports: [AdminSideNav],
  templateUrl: './manage-users.html',
  styleUrls: ['./manage-users.css'],
})
export class ManageUsers {}
