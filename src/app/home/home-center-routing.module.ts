import { Routes } from '@angular/router';
import { PostComponent } from '../post/post.component';
import { HomeComponent } from './home.component';


export const childroutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'create-post',
        component: PostComponent,

        },
    ]
}
]



