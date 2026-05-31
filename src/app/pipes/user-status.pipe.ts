import { Pipe, PipeTransform } from "@angular/core";
import { SocketService } from "../core/services/socket.service";
import { UserStatus } from "../shared/types/user-status.type";
import { map, Observable } from "rxjs";

@Pipe({ name: 'userStatusPipe', pure: true, standalone: true })
export class UserStatusPipe implements PipeTransform {
  constructor(private socketService: SocketService) {}

  transform(userId: string): Observable<UserStatus> {
    return this.socketService.userStatusMap$.pipe(
      map(statusMap => statusMap.get(userId) || 'offline')
    );
  }
}
