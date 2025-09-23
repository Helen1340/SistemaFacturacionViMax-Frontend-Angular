import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './module-home/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Use the modern way with `withInterceptors`
    provideHttpClient(
      withInterceptors([
        AuthInterceptor // <- Pass the interceptor function directly here
      ]),
      withFetch() // `withFetch` is also a feature you provide here
    ),
  ]
};