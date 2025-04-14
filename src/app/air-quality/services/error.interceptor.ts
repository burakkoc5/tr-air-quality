import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          // Exponential backoff: 1s, 2s, 4s
          return timer(Math.pow(2, retryCount - 1) * 1000);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error:', error);
        
        let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
        if (error.status === 0) {
          errorMessage = 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.';
        } else if (error.status === 404) {
          errorMessage = 'İstenen veri bulunamadı.';
        }

        // You can show this error message using a notification service
        return throwError(() => new Error(errorMessage));
      })
    );
  }
} 