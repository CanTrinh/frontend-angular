// video.service.ts
import { inject, Injectable } from '@angular/core';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { io, Socket } from 'socket.io-client';
import { SocketService } from '../core/services/socket.service';


@Injectable({ providedIn: 'root' })
export class VideoService {
  private client: IAgoraRTCClient;
  localVideoTrack: ICameraVideoTrack;
  localAudioTrack: IMicrophoneAudioTrack;

  isMicEnabled = true;
  isCamEnabled = true;

  private socketService = inject(SocketService);


  constructor() {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }

  async joinCall(roomId: string, appId: string, channel: string, token: string, userId: string,callType: 'VOICE' | 'VIDEO') {
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

    // 1. Join vào channel Agora
    await this.client.join(appId, channel, token, userId);

    this.socketService.changeStatusCall(roomId);
    console.log('🚀 Đã báo cáo lên NestJS chuyển trạng thái phòng sang ONGOING');
    
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
    /*this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      
      if (mediaType === 'video' && callType === 'VIDEO') {
        // Tạo một thẻ div động hoặc gán ID cố định để hiển thị camera người kia
        user.videoTrack?.play('remote-player');
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play(); // Tự động phát âm thanh qua loa/tai nghe
      }
    });*/
  }

  //bật tắt Mic
  async toggleMic() {
    if (!this.localAudioTrack) return null;
    
    // Đảo ngược trạng thái hiện tại
    this.isMicEnabled = !this.isMicEnabled;
    
    // setEnabled(true): Bật tiếng | setEnabled(false): Tắt tiếng (Mute) [AG]
    await this.localAudioTrack.setEnabled(this.isMicEnabled);
    
    console.log(`🎙️ Trạng thái Micro hiện tại: ${this.isMicEnabled ? 'BẬT' : 'MUTE'}`);
    return this.isMicEnabled;
  }

  // Bật tắt cam
  async toggleCam() {
    if (!this.localVideoTrack) return null;
    
    // Đảo ngược trạng thái hiện tại
    this.isCamEnabled = !this.isCamEnabled;
    
    // setEnabled(true): Hiện hình | setEnabled(false): Tắt hình (Màn hình đen) [AG]
    await this.localVideoTrack.setEnabled(this.isCamEnabled);
    
    console.log(`📹 Trạng thái Camera hiện tại: ${this.isCamEnabled ? 'BẬT' : 'MUTE'}`);
    return this.isCamEnabled;
  }

  async leaveCall() {
    this.localAudioTrack?.close();
    this.localVideoTrack?.close();
    await this.client.leave();
  }
}
