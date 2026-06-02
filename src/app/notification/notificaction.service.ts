// src/app/core/services/notification-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface NotificationResponse {
  data: any[];
  totalNoti: number;
  totalUnseen: number;
  currentPage: number;
  totalPages: number;
  limitNotiforAPage: number;

}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  /*
  *
   * Lấy danh sách thông báo có phân trang
   * @param page Trang hiện tại
   * @param limit Số lượng bản ghi mỗi trang
   */
  getNotifications(page: number = 1, limit: number = 10): Observable<NotificationResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<NotificationResponse>(this.API_URL, { params });
  }

  markAsSeen(isSeen: boolean){
    return this.http.patch<NotificationResponse>(`${this.API_URL}/seen`, {isSeen});
  }

  /*
  *
   * Đánh dấu một thông báo là đã đọc
   * @param notificationId ID của thông báo
   */
  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/${notificationId}/read`,{});
  }

  /*
  *
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.API_URL}/mark-all-read`, {});
  }

  /*
  *
   * Xóa một thông báo (nếu cần tính năng này)
   */
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${notificationId}`);
  }
}
