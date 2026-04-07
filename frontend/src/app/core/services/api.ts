import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';

export type ItemType = 'lost' | 'found';

export interface BrowseItem {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  location: string;
  dateLost?: string;
  dateFound?: string;
  imageUrl?: string | null;
  status: string;
  userId: string;
  createdAt?: string;
}

export interface BrowseResponse {
  lostItems: BrowseItem[];
  foundItems: BrowseItem[];
}

export interface MyItemsResponse {
  lostItems: BrowseItem[];
  foundItems: BrowseItem[];
}

export interface AdminItemRecord extends BrowseItem {
  user?: { name?: string; email?: string };
}

export interface AdminPendingItemsResponse {
  lostItems: AdminItemRecord[];
  foundItems: AdminItemRecord[];
}

export interface AdminClaimRecord {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string | null;
  userId: string;
  user?: { name?: string; email?: string };
  lostItemId?: string | null;
  foundItemId?: string | null;
  lostItem?: AdminItemRecord | null;
  foundItem?: AdminItemRecord | null;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  _count: {
    lostItems: number;
    foundItems: number;
    claims: number;
  };
}

export interface AdminDashboardResponse {
  stats: {
    totalUsers: number;
    pendingItems: number;
    approvedItems: number;
    pendingClaims: number;
    matchedItems: number;
  };
  pendingItems: AdminPendingItemsResponse;
  pendingClaims: AdminClaimRecord[];
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly http = inject(HttpClient);

  reportItem(body: {
    title: string;
    description?: string;
    category: string;
    location: string;
    dateLost: string;
    imageUrl?: string;
    type: ItemType;
  }): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/items`, body);
  }

  browseItems(filters: {
    type?: ItemType;
    category?: string;
    location?: string;
    keyword?: string;
  }): Observable<BrowseResponse> {
    let params = new HttpParams();
    if (filters.type) params = params.set('type', filters.type);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.keyword) params = params.set('keyword', filters.keyword);
    return this.http.get<BrowseResponse>(`${environment.apiUrl}/items`, { params });
  }

  getMyItems(): Observable<MyItemsResponse> {
    return this.http.get<MyItemsResponse>(`${environment.apiUrl}/items/my-items`);
  }

  getPendingItems(): Observable<AdminPendingItemsResponse> {
    return this.http.get<AdminPendingItemsResponse>(
      `${environment.apiUrl}/admin/pending-items`,
    );
  }

  getAdminDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(
      `${environment.apiUrl}/admin/dashboard`,
    );
  }

  getAdminUsers(): Observable<AdminUserRecord[]> {
    return this.http.get<AdminUserRecord[]>(`${environment.apiUrl}/admin/users`);
  }

  updateItemStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    adminMessage?: string,
  ): Observable<unknown> {
    const path = status === 'APPROVED' ? 'approve' : 'reject';
    return this.http.put(`${environment.apiUrl}/admin/items/${id}/${path}`, {
      status,
      adminMessage,
    });
  }

  getAdminClaims(status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Observable<AdminClaimRecord[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<AdminClaimRecord[]>(
      `${environment.apiUrl}/admin/pending-claims`,
      { params },
    );
  }

  updateClaimStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    adminMessage?: string,
  ): Observable<unknown> {
    const path = status === 'APPROVED' ? 'approve' : 'reject';
    return this.http.put(`${environment.apiUrl}/admin/claims/${id}/${path}`, {
      status,
      adminMessage,
    });
  }

  getNotifications(): Observable<NotificationRecord[]> {
    return this.http.get<NotificationRecord[]>(
      `${environment.apiUrl}/notifications`,
    );
  }

  createClaim(body: { itemId: string; message: string }): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/claims`, body);
  }
}
