import { Routes } from '@angular/router';
import { YamahaCenterComponent } from './yamaha-center/yamaha-center.component';
import { YamahaListComponent } from './yamaha-list/yamaha-list.component';
import { YamahaDetailComponent } from './yamaha-detail/yamaha-detail.component';
import { YamahaCenterHomeComponent } from './yamaha-center-home/yamaha-center-home.component';
import { canDeactivateGuard } from '../can-deactivate.guard';
import { YamahaDetailResolver } from './yamha-detail-resolver';


export const childroutes: Routes = [
  {
    path: '',
    component: YamahaCenterComponent,
    children: [
      {
        path: '',
        component: YamahaListComponent,
        children: [
          {
            path: ':id',
            component: YamahaDetailComponent,
            canDeactivate: [canDeactivateGuard],
            resolve: {
            xeya: YamahaDetailResolver
          }
          },
          {
            path: '',
            component: YamahaCenterHomeComponent
          }
        ]
      }
    ]
  }

];



