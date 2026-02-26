import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomeComponent } from './home/home.component';
import { HondaListComponent } from './honda/honda-list/honda-list.component';
import { YamahaCenterComponent } from './yamaha/yamaha-center/yamaha-center.component';
import { YamahaListComponent } from './yamaha/yamaha-list/yamaha-list.component';
import { YamahaDetailComponent } from './yamaha/yamaha-detail/yamaha-detail.component';
import { YamahaCenterHomeComponent } from './yamaha/yamaha-center-home/yamaha-center-home.component';
import { YamahaDetailResolver } from './yamaha/yamha-detail-resolver';
import { canDeactivateGuard } from './can-deactivate.guard';
import { HondaDetailComponent } from './honda/honda-detail/honda-detail.component';
import { EnglishComponent } from './english/english.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from '../app/features/auth/register/register.component';
import { PostComponent } from './post/post.component';
import { authGuard } from './authentication/auth.guard';
import { HomeDetailComponent } from './home/home-detail/home-detail.component';
import { ProfileComponent } from './features/auth/profile/profile.component';




export const appRoutes: Routes = [
  {
    path: 'home',component: HomeComponent,
    //loadChildren: ()=> import ('./home/home-center-routing.module').then(m=>m.childroutes),
  },
  {
    path: 'posts/:id',component: HomeDetailComponent,
  },
  {
    path: 'home/create-post',component: PostComponent, canActivate: [authGuard]
  },
  {
    path: 'yamaha',
    //component:YamahaCenterComponent,
    loadChildren: () => import('./yamaha/yamaha-center-routing.module').then(m=> m.childroutes),
  },
  // {
  //   path: 'honda',
  //   loadChildren: () => import('./honda/honda-routing.module').then(m => m.hondaroutes),
  
  // },
  // { path: 'honda', redirectTo: '/superhonda' },
  // { path: 'honda/:id', redirectTo: '/superhonda/:id' },
  { path: 'honda',  component: HondaListComponent, data: {animation: 'listxe'} },
  { path: 'honda/:id', component: HondaDetailComponent, data: {animation: 'xe'}},
  { path: 'english', component: EnglishComponent},
  { path: 'login' , component: LoginComponent},
  { path: 'user/profile' , component: ProfileComponent},
  { path: 'register' , component: RegisterComponent},

  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];





