import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../config/environment';
import {
  JIRANI_ACCESS_TOKEN_KEY,
  JIRANI_USER_KEY,
} from '../auth/storage-keys';

export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

interface RegisterResponse {
  message: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<AuthUser | null>(this.readUserFromStorage());

  register(body: {
    name: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${environment.apiUrl}/auth/register`,
      body,
    );
  }

  verifyEmail(email: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/verify-email`,
      { email, code },
    );
  }

  resendVerification(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/resend-verification`,
      { email },
    );
  }

  login(body: { email: string; password: string }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, body)
      .pipe(tap((res) => this.persistSession(res)));
  }

  logout(): void {
    localStorage.removeItem(JIRANI_ACCESS_TOKEN_KEY);
    localStorage.removeItem(JIRANI_USER_KEY);
    this.currentUser.set(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(JIRANI_ACCESS_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  postLoginPath(): string {
    return this.isAdmin() ? '/admin-dashboard' : '/user-dashboard';
  }

  private persistSession(res: LoginResponse): void {
    localStorage.setItem(JIRANI_ACCESS_TOKEN_KEY, res.access_token);
    localStorage.setItem(JIRANI_USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private readUserFromStorage(): AuthUser | null {
    const raw = localStorage.getItem(JIRANI_USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
