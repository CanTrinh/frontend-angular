import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HondaListComponent } from './honda-list/honda-list.component';
import { HondaDetailComponent } from './honda-detail/honda-detail.component';
import { HondaCenterComponent } from './honda-center/honda-center.component';

export const hondaroutes: Routes = [
  { path:'',
    component: HondaCenterComponent,
    children: [
      { path: ':id', component: HondaDetailComponent },
      { path: '',  component: HondaListComponent },
    ]
  }
  
];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule]
// })
// export class HondaRoutingModule { }
