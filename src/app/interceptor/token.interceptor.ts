import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (sessionStorage.getItem('token') === null) {
    sessionStorage.setItem('token', String(Date.now()));
  }

  const token = sessionStorage.getItem('token');
  const username =
    sessionStorage.getItem('username') == null
      ? 'anonymous'
      : sessionStorage.getItem('username');

  const req_with_token: HttpRequest<any> = req.clone({
    setHeaders: {
      Authorization: `${token}`,
      qabotusername: `${username}`,
    },
  });

  return next(req_with_token);
};
