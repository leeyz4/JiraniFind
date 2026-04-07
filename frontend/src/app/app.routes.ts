import { Routes } from '@angular/router';
import { Home } from './components/landing/home/home';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { Verify } from './components/auth/verify/verify';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';
import { ManageClaims } from './components/admin/manage-claims/manage-claims';
import { ManageUsers } from './components/admin/manage-users/manage-users';
import { PendingItems } from './components/admin/pending-items/pending-items';
import { BrowseItems } from './components/user/browse-items/browse-items';
import { MyItems } from './components/user/my-items/my-items';
import { Profile } from './components/user/profile/profile';
import { ReportItem } from './components/user/report-item/report-item';
import { UserDashboard } from './components/user/user-dashboard/user-dashboard';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'verify', component: Verify },
  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'manage-claims',
    component: ManageClaims,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'manage-users',
    component: ManageUsers,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'pending-items',
    component: PendingItems,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'browse-items',
    component: BrowseItems,
    canActivate: [authGuard],
  },
  {
    path: 'my-items',
    component: MyItems,
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard],
  },
  {
    path: 'report-item',
    component: ReportItem,
    canActivate: [authGuard],
  },
  {
    path: 'user-dashboard',
    component: UserDashboard,
    canActivate: [authGuard],
  },
];
