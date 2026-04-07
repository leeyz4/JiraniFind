import { HttpInterceptorFn } from '@angular/common/http';
import { JIRANI_ACCESS_TOKEN_KEY } from '../auth/storage-keys';
import { environment } from '../config/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  const token = localStorage.getItem(JIRANI_ACCESS_TOKEN_KEY);
  if (!token) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
