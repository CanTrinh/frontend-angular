import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { io, Socket } from 'socket.io-client';
import { UserStatus } from "src/app/shared/types/user-status.type";
import { LoginService } from '../../features/auth/login/login.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

    // --- QUẢN LÝ TRẠNG THÁI ONLINE/OFFLINE ---
  private userStatusMap = new BehaviorSubject<Map<string, UserStatus>>(new Map());
  userStatusMap$ = this.userStatusMap.asObservable();

  // --- QUẢN LÝ CUỘC GỌI AGORA VOICE/VIDEO ---
  private incomingCall = new Subject<any>();
  incomingCall$ = this.incomingCall.asObservable();
  
  private callResponse = new Subject<any>();
  callResponse$ = this.callResponse.asObservable();

  private callEnded = new Subject<any>();
  callEnded$ = this.callEnded.asObservable();

  // --- QUẢN LÝ CHAT ROOMS & MESSAGES ---
  // BehaviorSubject quản lý toàn bộ danh sách phòng chat hiển thị ở Sidebar (Tự động cập nhật khi có phòng mới)
  private roomsSource = new BehaviorSubject<any[]>([]);
  rooms$ = this.roomsSource.asObservable();

  // BehaviorSubject quản lý tin nhắn của PHÒNG CHAT ĐANG MỞ (Để tránh loạn tin nhắn giữa các phòng)
  private currentRoomMessagesSource = new BehaviorSubject<any[]>([]);
  currentRoomMessages$ = this.currentRoomMessagesSource.asObservable();
  private activeRoomId: string | null = null;

  // --- QUẢN LÝ CHUÔNG THÔNG BÁO ---
  private notificationSub = new BehaviorSubject<any>(null);
  notificationSub$ = this.notificationSub.asObservable();


  constructor() {}

  async connect() {
    if (this.socket?.connected) return;

    const access_token = localStorage.getItem('access_token'); 
    if (!access_token) return; // Không có token thì không kết nối

    // 1. Đổi từ query sang auth để bảo mật
    this.socket = io('https://api.ctlife.xyz', { 
      auth: {
        token: `Bearer ${access_token}`
      },
      transports: ['websocket'],
      autoConnect: false,
    });

    // 2. Lắng nghe sự kiện
    this.setupSocketListeners();

    // 3. KÍCH HOẠT KẾT NỐI (Lúc này NestJS phản hồi về là Angular bắt được ngay)
    this.socket.connect();
  }

  public setupSocketListeners() {
    this.socket.on('userStatusChanged', (data: { userId: string, status: UserStatus }) => {
      const currentMap = new Map(this.userStatusMap.value);
      currentMap.set(data.userId, data.status);
      this.userStatusMap.next(currentMap);
      console.log('Bản đồ trạng thái hiện tại:', this.userStatusMap.value);

    });

    this.socket.on('initialOnlineUsers', (users: string[]) => {
      console.log('👉 Angular ĐÃ NHẬN initialOnlineUsers:', users);
      const currentMap = new Map(this.userStatusMap.value);
      users.forEach(id => currentMap.set(id, 'online'));
      this.userStatusMap.next(currentMap);
      console.log('Bản đồ trạng thái hiện tại:', this.userStatusMap.value);

    });

    // --- LẮNG NGHE CHUÔNG THÔNG BÁO TỪ HTTP/DB ---
    this.socket.on('newFriendRequest', (data) => this.notificationSub.next(data));
    this.socket.on('Accepted request', (data) => this.notificationSub.next(data));
    this.socket.on('newNotification', (data) => this.notificationSub.next(data));

    // --- LẮNG NGHE ĐIỀU HƯỚNG PHÒNG CHAT (CHỦ ĐỘNG & BỊ ĐỘNG) ---
    // Được kích hoạt khi user tạo phòng thành công HOẶC có người khác điền ID user vào phòng chat nhóm
    this.socket.on('new_room_created', (newRoom: any) => {
      const currentRooms = this.roomsSource.value;
      // Đẩy phòng mới lên trên cùng thanh Sidebar
      this.roomsSource.next([newRoom, ...currentRooms]);
      // Tự động join socket room của phòng chat này để nhận tin nhắn ngầm
      this.socket.emit('join_room', { roomId: newRoom.id });
    });

    // Lắng nghe tin nhắn mới đổ về
    this.socket.on('newMessage', (messageData: any) => {
      // 1. Cập nhật tin nhắn vào giao diện nếu user đang mở đúng phòng chat này
      if (this.activeRoomId === messageData.roomId) {
        const currentMsgs = this.currentRoomMessagesSource.value;
        // Chặn trùng lặp tin nhắn nếu client tự append trước đó
        if (!currentMsgs.some(m => m.id === messageData.id)) {
          this.currentRoomMessagesSource.next([...currentMsgs, messageData]);
        }
      }
      
      // 2. Cập nhật tin nhắn mới nhất hiển thị dưới dạng "Preview" ở Sidebar
      const currentRooms = this.roomsSource.value.map(room => {
        if (room.id === messageData.roomId) {
          return { ...room, lastMessage: messageData, unreadCount: this.activeRoomId === room.id ? 0 : (room.unreadCount || 0) + 1 };
        }
        return room;
      });
      this.roomsSource.next(currentRooms);
    });

    // --- LẮNG NGHE TÍN HIỆU CUỘC GỌI AGORA ---
    this.socket.on('incomingCall', (data) => {
      console.log('dữ liệu cuộc gọi người nhận:', data);
      this.incomingCall.next(data);
    });
    this.socket.on('callRejectedEvent', (data) => this.callResponse.next(data));
    this.socket.on('callAcceptedEvent', (data) => this.callResponse.next(data));
    this.socket.on('callEndedEvent', (data) => this.callEnded.next(data));


    // Xử lý lỗi token hết hạn khi đang chạy
    this.socket.on('connect_error', (err) => {
      if (err.message === 'Authentication error') {
        console.log('Token expired, please login again');
      }
    });
    
  }

  // Gửi tin nhắn
  sendMessage( content: string) {
    //this.socket.emit('sendMessage', { roomId, message, senderName });
      
    // Update local ngay lập tức để user thấy tin nhắn của mình (UX mượt)
    const currentMsgs = this.currentRoomMessagesSource.value;
    this.currentRoomMessagesSource.next([...currentMsgs, { 
      content: content, 
      time: new Date(),
      isMe: true 
    }]);
  }

  /* Lắng nghe tin nhắn mới
  setupChatListeners() {
    this.socket.on('newMessage', (data) => {
      const currentMsgs = this.currentRoomMessagesSource.value;
      // Chỉ thêm nếu không phải tin nhắn của chính mình (vì mình đã update ở trên)
      this.currentRoomMessagesSource.next([...currentMsgs, { ...data, isMe: false }]);
    });
  }*/


  // Gửi một phát toàn bộ dữ liệu, nhận về 1 bản ghi Token duy nhất cho CHÍNH người gọi
  makeCall(roomId: string, toUserIds: string[], fromName: string, channelName: string, callType: "VOICE"|"VIDEO"): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('callUser', { roomId, toUserIds, fromName, channelName, callType }, (res: any) => {
        if (res.error) {
          reject(res.error);
        } else {
          resolve(res); // Trả về status và agoraToken cho CHÍNH người gọi (A)
        }
      });
    });
  }

  acceptedCall(roomId: string, channelName: string,){
    return new Promise((resolve, reject) => {
      this.socket.emit('acceptCall', { roomId,channelName}, (res: any) => {
        if (res.error) {
          reject(res.error);
        } else {
          resolve(res); // Trả về status và agoraToken cho CHÍNH người gọi (A)
        }
      });
    });
  }


  changeStatusCall(roomId:string){
    this.socket.emit('callConnectedSuccess', { roomId });
  }

  rejectCall(roomId: string, callerId: string, callType: 'VOICE' | 'VIDEO' ){
        return new Promise((resolve, reject) => {
      this.socket.emit('rejectCall', { roomId,callerId,callType}, (res: any) => {
        if (res.error) {
          reject(res.error);
        } else {
          resolve(res); // Trả về status và agoraToken cho CHÍNH người gọi (A)
        }
      });
    });
  }

  endedCall(roomId: string, callerId: string,){
    return new Promise((resolve, reject) => {
      this.socket.emit('endCall', { roomId,callerId}, (res: any) => {
        if (res.error) {
          reject(res.error);
        } else {
          resolve(res); // Trả về status và agoraToken cho CHÍNH người gọi (A)
        }
      });
    });
  }



  //phat di thong bao tao phong chat hay 1-1
  createRoomchat(roomId: string, userIds:string[]) {
    this.socket.emit('invite-to-group', { roomId, userIds});
  }

  joinRoom(roomId: string) {
    this.socket.emit('join_room', { roomId:roomId});
  }

  setInitialMessages(roomId: string, httpMessages: any[]) {
    // 1. Đánh dấu phòng này là phòng đang mở trực tiếp trên giao diện
    this.activeRoomId = roomId;

    // 2. Kiểm tra và đảo ngược mảng NẾU Backend của bạn trả về dạng tin mới lên trước (desc)
    // Nếu Backend đã sắp xếp sẵn theo thứ tự thời gian tăng dần (asc), bạn có thể bỏ qua dòng .reverse() này
    const formattedMessages = [...httpMessages].reverse(); 

    // 3. Xóa sạch tin cũ và nạp mảng tin nhắn mới vào Stream
    this.currentRoomMessagesSource.next(formattedMessages);
  }


  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.userStatusMap.next(new Map()); // Xóa danh sách online khi logout
    }
  }
}
