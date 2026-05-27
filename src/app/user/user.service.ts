import { HttpParams,HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user`;
  constructor() { }
  

   
   searchUsers(searchTerm: string): Observable<any> {
    // Nếu searchTerm trống, API sẽ là .../users
    // Nếu có searchTerm, API sẽ là .../users?search=keyword
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
  
    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  addFriend(friendId: string){
    return this.http.post(`${environment.apiUrl}/user/friendship/add`, { friendId });
  }

  resAddFriend(noti: any, status: string){
    const payload = {
    receiveId: noti.metadata.senderId, // Lấy từ metadata cua nguoi gửi A qua socket
    friendShipId: noti.relatedId,     // Lấy từ relatedId trong DB
    status: status
    };

    // đây là người B gửi phản hồi yêu cầu kết bạn của A
    return this.http.patch(`${environment.apiUrl}/user/friendship/respond`, payload);
    /*.subscribe(() => {
      // Sau khi thành công, xóa hoặc cập nhật local UI
      this.removeNotificationLocally(noti.id);
    });*/
  }

  createRoom(payload: any){
    return this.http.post(`${environment.apiUrl}/user/chatroom/create`, payload);
  }

  getUserRooms(){
    return this.http.get(`${environment.apiUrl}/user/chatroom/gets`);
  }

  getMessages(roomId:string){
    return this.http.get(`${environment.apiUrl}/user/chatroom/gets/${roomId}`);
  }

  getFriends(){
    return this.http.get(`${environment.apiUrl}/user/friend/gets`)
  }


}
