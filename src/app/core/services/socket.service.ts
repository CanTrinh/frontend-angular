import { inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { io, Socket } from 'socket.io-client';
import { UserStatus } from "src/app/shared/types/user-status.type";
import { LoginService } from '../../features/auth/login/login.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private userStatusMap = new BehaviorSubject<Map<string, UserStatus>>(new Map());
  userStatusMap$ = this.userStatusMap.asObservable();

  constructor(private authService: LoginService) {}

  connect() {
    if (this.socket?.connected) return;

    const access_token = this.authService.getToken();
    if (!access_token) return; // Không có token thì không kết nối

    // 1. Đổi từ query sang auth để bảo mật
    this.socket = io('https://api.ctlife.xyz', { 
      auth: {
        token: `Bearer ${access_token}`
      },
      transports: ['websocket']
    });

    // 2. Lắng nghe sự kiện
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('userStatusChanged', (data: { userId: string, status: UserStatus }) => {
      const currentMap = new Map(this.userStatusMap.value);
      currentMap.set(data.userId, data.status);
      this.userStatusMap.next(currentMap);
    });

    this.socket.on('initialOnlineUsers', (users: string[]) => {
      const currentMap = new Map();
      users.forEach(id => currentMap.set(id, 'online'));
      this.userStatusMap.next(currentMap);
    });

    // Xử lý lỗi token hết hạn khi đang chạy
    this.socket.on('connect_error', (err) => {
      if (err.message === 'Authentication error') {
        console.log('Token expired, please login again');
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.userStatusMap.next(new Map()); // Xóa danh sách online khi logout
    }
  }
}
