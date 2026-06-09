// video.service.ts
import { Injectable } from '@angular/core';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private client: IAgoraRTCClient;
  localVideoTrack: ICameraVideoTrack;
  localAudioTrack: IMicrophoneAudioTrack;

  constructor() {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }

  async joinCall(appId: string, channel: string, token: string, userId: string,callType: 'VOICE' | 'VIDEO') {
    // 1. Join vào channel Agora
    await this.client.join(appId, channel, token, userId);

    
        // 2. Phân loại cấu hình thiết bị phần cứng theo loại cuộc gọi
    if (callType === 'VIDEO') {
      // Bật cả mic và cam
      [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
      
      // Phát hình ảnh local của mình lên giao diện HTML có id 'local-player'
      this.localVideoTrack.play('local-player');
    } else {
      // Chỉ bật mic cho Voice Call
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await this.client.publish([this.localAudioTrack]);
    }

    // 3. Lắng nghe luồng dữ liệu (Stream) từ những người khác tham gia phòng họp
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      
      if (mediaType === 'video' && callType === 'VIDEO') {
        // Tạo một thẻ div động hoặc gán ID cố định để hiển thị camera người kia
        user.videoTrack?.play('remote-player');
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play(); // Tự động phát âm thanh qua loa/tai nghe
      }
    });
  }

  async leaveCall() {
    this.localAudioTrack?.close();
    this.localVideoTrack?.close();
    await this.client.leave();
  }
}
