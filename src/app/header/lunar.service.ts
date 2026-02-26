import { Injectable } from '@angular/core';
import amlich from 'amlich';

@Injectable({ providedIn: 'root' })
export class LunarService {
  getLunarDate(date: Date) {
    const lunar = amlich.convertSolar2Lunar(
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear(),
      7 // Vietnam timezone
    );

    return {
      day: lunar[0],
      month: lunar[1],
      year: lunar[2],
      leap: lunar[3] === 1
    };
  }

  
}
