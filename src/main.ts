import { bootstrapApplication } from '@angular/platform-browser';
//import { provideProtractorTestingSupport } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { RouterModule, provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes,  } from './app/app-routing.module';
import { EnvironmentInjector, Injectable, importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; // setup cho viec giao tiep voi server qua http
import { slideInAnimation } from './app/animations';
import { HttpErrorHandler } from './app/http-error-handler.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/authentication/auth.interceptor';
import { errorInterceptor } from './app/authentication/error.interceptor';
import { MessageService } from './app/message.service';
import { LoginService } from './app/features/auth/login/login.service';
import { cacheInterceptor } from './app/core/interceptors/http-cache.interceptor';
// import { importProvidersFrom } from '@angular/core';
//import { HttpClientModule } from '@angular/common/http';

bootstrapApplication(AppComponent,{
 providers: [
  provideRouter(appRoutes, withComponentInputBinding()),
  //importProvidersFrom(HttpClientModule), HttpErrorHandler,MessageService,LoginService, 
  provideAnimations(),
      provideHttpClient(
      withInterceptors([
        authInterceptor,    // 1. Gắn token trước
        cacheInterceptor,   // 2. Kiểm tra cache (lưu cả request đã có token)
        errorInterceptor    // 3. Xử lý lỗi cuối cùng
      ])),
  MessageService,
  LoginService
] 
   //withInterceptors([...]) expects functions (HttpInterceptorFn) thay vi mot class(vi dang dung standalone)
 }).catch(err => console.error(err));



