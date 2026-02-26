import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn, Router} from '@angular/router';
import {EMPTY, of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

import { xeYa } from './yamaha';
import { YamahaService } from './yamaha.service';

export const YamahaDetailResolver: ResolveFn<xeYa> = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const cs = inject(YamahaService);
  const id = route.paramMap.get('id')!;

  return cs.getXeYa(id).pipe(mergeMap(xeya => {
    if (xeya) {
      return of(xeya);
    } else {  // id not found
      router.navigate(['/yamaha']);
      return EMPTY;
    }
  }));
};