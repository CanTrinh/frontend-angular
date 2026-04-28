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

  async joinChannel(appId: string, channel: string, token: string, userId: string) {
    await this.client.join(appId, channel, token, userId);
    
    // Mở mic và camera
    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    
    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
    return this.client.remoteUsers; // Trả về để hiển thị video người kia
  }

  async leave() {
    this.localAudioTrack?.close();
    this.localVideoTrack?.close();
    await this.client.leave();
  }
}
