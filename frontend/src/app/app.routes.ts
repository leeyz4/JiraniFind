import { Routes } from '@angular/router';
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


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'verify', component: Verify },
    { path: 'admin-dashboard', component: AdminDashboard },
    { path: 'manage-claims', component: ManageClaims },
    { path: 'manage-users', component: ManageUsers },
    { path: 'pending-items', component: PendingItems },
    { path: 'browse-items', component: BrowseItems },
    { path: 'my-items', component: MyItems },
    { path: 'profile', component: Profile },
    { path: 'report-item', component: ReportItem },
    { path: 'user-dashboard', component: UserDashboard },
];
