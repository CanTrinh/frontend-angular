import { Pipe, PipeTransform } from "@angular/core";
import { SocketService } from "../core/services/socket.service";
import { UserStatus } from "../shared/types/user-status.type";
import { map, Observable } from "rxjs";

@Pipe({ name: 'userStatusPipe', pure: true, standalone: true })
export class UserStatusPipe implements PipeTransform {
  constructor(private socketService: SocketService) {}

  transform(userId: string): Observable<UserStatus> {
    return this.socketService.userStatusMap$.pipe(
      map(statusMap => {
      const status = statusMap.get(userId) || 'offline';
      console.log(`[Pipe Check] userId gốc: ${userId} (Kiểu: ${typeof userId}) -> Trạng thái tìm được: ${status}`); // 👈 Thêm dòng này
      return status;
      }
    ))
  }
}
