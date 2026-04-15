import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { io, Socket } from 'socket.io-client';
import { UserStatus } from "src/app/shared/types/user-status.type";

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private userStatusMap = new BehaviorSubject<Map<string, UserStatus>>(new Map());
  userStatusMap$ = this.userStatusMap.asObservable();

  connect(userId: string) {
    if (this.socket?.connected) return; // Nếu đã kết nối rồi thì không làm gì cả
    // Kết nối tới NestJS Gateway kèm theo userId trong query
    this.socket = io('https://api.ctlife.xyz', { 
      query: { userId },
      transports: ['websocket'] // Ép dùng websocket để nhanh và ổn định hơn
    });

    // Bắt đầu lắng nghe các sự kiện từ Gateway
    this.socket.on('userStatusChanged', (data: { userId: string, status: UserStatus }) => {
      const currentMap = new Map(this.userStatusMap.value);
      currentMap.set(data.userId, data.status);
      this.userStatusMap.next(currentMap);
    });

    // Lắng nghe danh sách toàn bộ user online khi vừa mới kết nối (nếu cần)
    this.socket.on('initialOnlineUsers', (users: string[]) => {
      const currentMap = new Map();
      users.forEach(id => currentMap.set(id, 'online'));
      this.userStatusMap.next(currentMap);
    });
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}