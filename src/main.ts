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
// import { importProvidersFrom } from '@angular/core';
//import { HttpClientModule } from '@angular/common/http';

bootstrapApplication(AppComponent,{
 providers: [provideRouter(appRoutes, withComponentInputBinding()),
    importProvidersFrom(HttpClientModule), HttpErrorHandler, provideAnimations(),
   provideHttpClient(withInterceptors([authInterceptor,errorInterceptor])),] 
   //withInterceptors([...]) expects functions (HttpInterceptorFn) thay vi mot class(vi dang dung standalone)
 }).catch(err => console.error(err));



