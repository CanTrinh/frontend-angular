import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',

})
export class UserSearchService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user`;
  constructor() { }

   createNewChatRoom(userIds: string[], isGroup: boolean){
    return this.http.post(`${environment.apiUrl}/user/chatroom/create`, {userIds, isGroup});
  }

}
