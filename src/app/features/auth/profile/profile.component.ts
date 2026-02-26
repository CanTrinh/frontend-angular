import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { ProfileService } from './profile.service';

@Component({

  selector: 'app-profile',
  standalone:true,
  templateUrl: './profile.component.html',
  imports: [ReactiveFormsModule, NgIf]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  previewUrl: string='';
  selectedFile: File | null = null;

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  constructor(private fb: FormBuilder, 
    private http: HttpClient,
    private profileService: ProfileService) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      bio: [''],
      profilePic: ['']
    });
  }

  ngAfterViewInit() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => this.video.nativeElement.srcObject = stream);
  }

  onFileSelected(event: any) {
    //this.selectedFile = event.target.files[0];
    const file: File = event.target.files[0];
    if (file){
      // Store the File object in the form control
      this.profileForm.patchValue({ profilePic: file });

      // If you want to preview the image, convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        // You can store the preview separately if you don’t want to overwrite the File
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

    }
  }

  capture() {
    const ctx = this.canvas.nativeElement.getContext('2d');
    ctx?.drawImage(this.video.nativeElement, 0, 0, 200, 200);
    const dataUrl = this.canvas.nativeElement.toDataURL('image/png');
    this.profileForm.patchValue({ profilePic: dataUrl });
    this.selectedFile = this.dataURLtoFile(dataUrl, 'profile.png');
  }

  dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  updateProfiles() {
    const formData = new FormData();
    formData.append('bio', this.profileForm.value.bio);
    //if (this.selectedFile) formData.append('profilePic', this.selectedFile);

    if (this.profileForm.value.profilePic) {
    formData.append('profilePic', this.profileForm.value.profilePic);
    }

    this.profileService.updateProfile(formData).subscribe({
    next: (res) =>{
      console.log('Update profile successfully:', res);
      this.profileForm.reset(); // clear form after success
        
    },
    error: (err) => {console.error('Error update profile:', err);
    }
    });


    
    /*if(this.profileForm.valid){
      this.profileService.updateProfile(this.profileForm.value)
      .subscribe({
        next: (res) => {
          console.log('Update profile successfully:', res);
          this.profileForm.reset(); // clear form after success
        
        },
        error: (err) => {
          console.error('Error update profile:', err);
        }
      });
    }*/
  
  }
}