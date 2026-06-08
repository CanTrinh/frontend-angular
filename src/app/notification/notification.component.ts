import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NotificationService } from './notificaction.service';
import { SocketService } from '../core/services/socket.service';
import { UserService } from '../user/user.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ClickOutsideDirective } from '../shared/directives/click-outside.directive';
import { LoginService } from '../features/auth/login/login.service';
import { AvatarComponent } from "../shared/components/avatar/avatar.component";
import { UserStatusPipe } from '../pipes/user-status.pipe';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, DatePipe, ClickOutsideDirective, AvatarComponent, UserStatusPipe],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  // Trạng thái hiển thị dropdown
  isOpen = false;
  
  // Danh sách thông báo
  notifications: any[] = [];
  
  // Quản lý số lượng chưa đọc bằng BehaviorSubject để dùng | async
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private unseenCountSubject = new BehaviorSubject<number>(0);
  unseenCount$ = this.unseenCountSubject.asObservable();
  // Phân trang
  page = 1;
  loading = false;
  hasMore = true;

  private subscription: Subscription = new Subscription();

  constructor(
    private notiApi: NotificationService,
    private socketService: SocketService,
    private userService: UserService,
    private loginService: LoginService
  ) {
        // 2. LẮNG NGHE TỰ ĐỘNG: Mỗi khi trạng thái user thay đổi, luồng này sẽ chạy
    this.loginService.user$.subscribe(user => {
      if (user && user.sub) {
        // Có user hợp lệ (Vừa login thành công HOẶC vừa F5 khôi phục từ localStorage)
        this.loadInitialNotifications();
      } else {
        // User logout -> Xóa sạch thông báo trong kho dữ liệu
        this.unseenCountSubject.next(0);
      }
    });
  }

  ngOnInit(): void {
    // Lắng nghe socket để nhận thông báo mới real-time
    const s = this.socketService.notificationSub$.subscribe((newNoti) => {
      if (newNoti) {
        // Đưa thông báo mới lên đầu (unshift)
        this.notifications = [newNoti, ...this.notifications];
        // Tăng số lượng chưa đọc
        this.unseenCountSubject.next(this.unreadCountSubject.value + 1);
      }
    });
    this.subscription.add(s);
  }

  // Đóng/mở Dropdown
  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if(this.unseenCountSubject.value !== 0){
      this.unseenCountSubject.next(0);
      this.notiApi.markAsSeen().subscribe({
        error: ()=>{
          console.log('lỗi gửi api http req');
        }
      });
    }
  }

  // Tải dữ liệu lần đầu
  loadInitialNotifications() {
    this.loading = true;
      this.notiApi.getNotifications(1).subscribe((res) => {
        this.notifications = res.data;
        this.unseenCountSubject.next(res.totalUnseen || 0); // Giả định server trả về totalUnread
        this.loading = false;
      });
  }

  // Đánh dấu 1 thông báo đã đọc (Optimistic Update)
  markAsRead(noti: any) {
    if (noti.isRead) return;

    noti.isRead = true; // Cập nhật UI ngay lập tức
    this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));

    this.notiApi.markAsRead(noti.id).subscribe({
      error: () => {
        noti.isRead = false; // Hoàn tác nếu lỗi
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
      }
    });
  }

  // Đánh dấu tất cả là đã đọc
  markAllRead() {
    this.notifications.forEach(n => n.isRead = true);
    this.unreadCountSubject.next(0);
    this.notiApi.markAllAsRead().subscribe({
      error: ()=> {
        console.log("lỗi kích hoạt api http read noti");
      }
    });
  }

  // Xử lý Chấp nhận/Từ chối kết bạn
  handleFriend(noti: any, status: 'ACCEPTED' | 'REJECTED', event: Event) {
    event.stopPropagation(); // Ngăn sự kiện click lan ra hàm markAsRead của item cha

    noti.metadata.isProcessed = true; // Ẩn các nút action ngay lập tức
    noti.isRead = true;

    this.userService.resAddFriend(noti, status).subscribe({
      next: () => {
        // Có thể thực hiện thêm logic chuyển hướng hoặc thông báo thành công
      },
      error: () => {
        noti.metadata.isProcessed = false; // Hoàn tác nếu lỗi
      }
    });
  }

  // Xử lý cuộn để tải thêm (Infinite Scroll)
  onScroll(event: any) {
    const element = event.target;
    // Kiểm tra nếu cuộn gần đến đáy (còn 10px)
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 10) {
      if (!this.loading && this.hasMore) {
        this.loadMore();
      }
    }
  }

  loadMore() {
    this.page++;
    this.loading = true;
    this.notiApi.getNotifications(this.page).subscribe((res) => {
      if (res.data.length > 0) {
        this.notifications = [...this.notifications, ...res.data];
      } else {
        this.hasMore = false;
      }
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
