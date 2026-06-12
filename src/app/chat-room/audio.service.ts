import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private ringtone!: HTMLAudioElement;

  constructor() {
    this.initRingtone();
  }

  private initRingtone() {
    // Khởi tạo đối tượng Audio với đường dẫn file từ thư mục assets
    this.ringtone = new Audio('../../assets/sounds/nokia_ringstone.mp3');
    // Bật chế độ tự động lặp lại khi hết bài (phù hợp cho nhạc chuông)
    this.ringtone.loop = true;
    this.ringtone.load();
  }

  // Gọi hàm này khi có cuộc gọi đến
  playRingtone(): void {
    this.ringtone.currentTime = 0;
    this.ringtone.play().catch(error => {
      console.error('Không thể phát nhạc chuông do chính sách trình duyệt:', error);
    });
  }

  // Gọi hàm này khi cuộc gọi được nhấc máy hoặc bị từ chối
  stopRingtone(): void {
    if (this.ringtone) {
      this.ringtone.pause();
      this.ringtone.currentTime = 0;
    }
  }
}
