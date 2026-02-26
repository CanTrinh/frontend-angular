import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Config, ConfigService } from './config.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent {
  error: any;
  headers: string[] = []; // thuoc tinh chua phan header cua res nhan dc
  config: Config | undefined; // cau hinh thuoc tinh config co type la interface config tu config.service

  constructor(private configService: ConfigService){}

  // ham nhan show data config la cac url trong config.json o file assets
  showConfig() {
    this.configService.getConfig()
      .subscribe({
        next: data => this.config = { 
                   weatherUrl: data.weatherUrl,
                   yamahaUrl:  data.yamahaUrl,
                   jsonFile: data.jsonFile }, // success path
        error: error => this.error = error, // error path
      });
  }

  // ham show res 
  showConfigResponse() {
    this.configService.getConfigResponse()
      // resp is of type `HttpResponse<Config>`
      .subscribe(resp => {
        // display its headers
        const keys = resp.headers.keys();
        this.headers = keys.map(key =>
          `${key}: ${resp.headers.get(key)}`);

        // access the body directly, which is typed as `Config`.
        this.config = { ...resp.body! };
        console.log(resp);
      });
  }


}
