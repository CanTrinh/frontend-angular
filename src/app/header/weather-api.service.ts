import { Injectable, Input } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { HeaderComponent } from './header.component';
import { IS_PUBLIC_API } from '../authentication/http-context';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-weather-location'
  })
};


@Injectable({
  providedIn: 'root'
})
export class WeatherApiService {




  weatherUrl = 'https://api.weatherapi.com/v1/current.json?key=7baf5398ee89483b8d8151105230911';

  constructor(
    private http: HttpClient
 ){}

  getWeatherData(latitude: string, longitude: string): Observable<HttpResponse<any>> {
    return this.http.get(`${this.weatherUrl}&q=${latitude},${longitude}`, { observe: 'response', responseType: 'json' , context: new HttpContext().set(IS_PUBLIC_API, true)

  });

    


  }




}
