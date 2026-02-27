import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { catchError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private updateUserUrl = `${environment.apiUrl}/user/profile/update-profile`; // NestJS backend
  constructor(private http: HttpClient) { 

  }

  updateProfile(formData: FormData ): Observable<UpdateProfileDto> {
      return this.http.put(this.updateUserUrl, formData);
  }



}
