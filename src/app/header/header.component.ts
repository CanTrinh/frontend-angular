//import { pipe } from '@angular/common';
import { DatePipe, NgFor, NgIf, NgForOf, } from '@angular/common';
import { AfterViewInit, Component, Directive, EventEmitter, Output, Type } from '@angular/core';
import { WeatherApiService } from './weather-api.service';
import { IconDirective } from './icon.directive';
import { SvgComponent } from '../svg/svg.component';
import { MatIconModule} from '@angular/material/icon'
import { HttpClient } from '@angular/common/http';
import { ThemeService } from './theme.service';
import { LunarService } from './lunar.service';
import { SanitizeUrlService } from '../sanitize-url.service';

//import { MatIconRegistry } from '@angular/material/icon';
//import { DomSanitizer } from '@angular/platform-browser';



@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [DatePipe, IconDirective, MatIconModule, NgForOf],
  providers: [WeatherApiService, ThemeService],
})

export class HeaderComponent implements AfterViewInit{
  today: number = Date.now();
  dayName = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  days = new Date; // tao ra tham so days cua la mot ham tao new Date
  result:string = `${this.dayName[this.days.getDay()]}`;
  tetDay: String = '';
  provinces =[
  { "name": "Hồ Chí Minh City", "lat": 10.7769, "lon": 106.7009 },
  { "name": "An Giang", "lat": 10.5149, "lon": 105.1132 },
  { "name": "Bà Rịa–Vũng Tàu", "lat": 10.3450, "lon": 107.0843 },
  { "name": "Bắc Giang", "lat": 21.3093, "lon": 106.6165 },
  { "name": "Bắc Kạn", "lat": 22.2572, "lon": 105.8589 },
  { "name": "Bạc Liêu", "lat": 9.3477, "lon": 105.5097 },
  { "name": "Bắc Ninh", "lat": 21.1861, "lon": 106.0763 },
  { "name": "Bến Tre", "lat": 10.2415, "lon": 106.3759 },
  { "name": "Bình Định", "lat": 13.7820, "lon": 109.2190 },
  { "name": "Bình Dương", "lat": 11.1730, "lon": 106.6710 },
  { "name": "Bình Phước", "lat": 11.7512, "lon": 106.7235 },
  { "name": "Bình Thuận", "lat": 11.0904, "lon": 108.0720 },
  { "name": "Cà Mau", "lat": 9.1760, "lon": 105.1500 },
  { "name": "Cao Bằng", "lat": 22.6650, "lon": 106.2570 },
  { "name": "Cần Thơ", "lat": 10.0452, "lon": 105.7469 },
  { "name": "Đà Nẵng", "lat": 16.0678, "lon": 108.2208 },
  { "name": "Đắk Lắk", "lat": 12.7100, "lon": 108.2378 },
  { "name": "Đắk Nông", "lat": 12.0030, "lon": 107.6900 },
  { "name": "Điện Biên", "lat": 21.3833, "lon": 103.0167 },
  { "name": "Đồng Nai", "lat": 10.9500, "lon": 107.0000 },
  { "name": "Đồng Tháp", "lat": 10.4200, "lon": 105.6300 },
  { "name": "Gia Lai", "lat": 13.9833, "lon": 108.0000 },
  { "name": "Hà Giang", "lat": 22.8333, "lon": 104.9833 },
  { "name": "Hà Nam", "lat": 20.5410, "lon": 105.9130 },
  { "name": "Hà Nội", "lat": 21.0278, "lon": 105.8342 },
  { "name": "Hà Tĩnh", "lat": 18.3333, "lon": 105.9000 },
  { "name": "Hải Dương", "lat": 20.9333, "lon": 106.3167 },
  { "name": "Hải Phòng", "lat": 20.8449, "lon": 106.6881 },
  { "name": "Hậu Giang", "lat": 9.7833, "lon": 105.4667 },
  { "name": "Hòa Bình", "lat": 20.8133, "lon": 105.3380 },
  { "name": "Hưng Yên", "lat": 20.6500, "lon": 106.0667 },
  { "name": "Khánh Hòa", "lat": 12.2388, "lon": 109.1967 },
  { "name": "Kiên Giang", "lat": 10.0125, "lon": 105.0809 },
  { "name": "Kon Tum", "lat": 14.3500, "lon": 108.0000 },
  { "name": "Lai Châu", "lat": 22.4000, "lon": 103.4000 },
  { "name": "Lâm Đồng", "lat": 11.9400, "lon": 108.4400 },
  { "name": "Lạng Sơn", "lat": 21.8500, "lon": 106.7500 },
  { "name": "Lào Cai", "lat": 22.4833, "lon": 103.9500 },
  { "name": "Long An", "lat": 10.5333, "lon": 106.4167 },
  { "name": "Nam Định", "lat": 20.4333, "lon": 106.1667 },
  { "name": "Nghệ An", "lat": 18.6733, "lon": 105.6922 },
  { "name": "Ninh Bình", "lat": 20.2500, "lon": 105.9750 },
  { "name": "Ninh Thuận", "lat": 11.5670, "lon": 108.9830 },
  { "name": "Phú Thọ", "lat": 21.3833, "lon": 105.2333 },
  { "name": "Phú Yên", "lat": 13.0833, "lon": 109.3000 },
  { "name": "Quảng Bình", "lat": 17.4833, "lon": 106.6000 },
  { "name": "Quảng Nam", "lat": 15.5667, "lon": 108.4833 },
  { "name": "Quảng Ngãi", "lat": 15.0000, "lon": 108.8000 },
  { "name": "Quảng Ninh", "lat": 20.9500, "lon": 107.0833 },
  { "name": "Quảng Trị", "lat": 16.7500, "lon": 107.2000 },
  { "name": "Sóc Trăng", "lat": 9.6000, "lon": 105.9719 },
  { "name": "Sơn La", "lat": 21.3333, "lon": 104.0000 },
  { "name": "Tây Ninh", "lat": 11.3333, "lon": 106.1000 },
  { "name": "Thái Bình", "lat": 20.4500, "lon": 106.3333 },
  { "name": "Thái Nguyên", "lat": 21.6000, "lon": 105.8500 },
  { "name": "Thanh Hóa", "lat": 19.8000, "lon": 105.7667 },
  { "name": "Thừa Thiên–Huế", "lat": 16.4637, "lon": 107.5909 },
  { "name": "Tiền Giang", "lat": 10.3667, "lon": 106.3500 },
  { "name": "Trà Vinh", "lat": 9.9333, "lon": 106.3500 },
  { "name": "Tuyên Quang", "lat": 21.8167, "lon": 105.2167 },
  { "name": "Vĩnh Long", "lat": 10.2500, "lon": 105.9500 },
  { "name": "Vĩnh Phúc", "lat": 21.3000, "lon": 105.6000 },
  { "name": "Yên Bái", "lat": 21.7000, "lon": 104.8667 }
]




  temp!: string;
  icon!: string;

    


  constructor(private weather: WeatherApiService, 
    private themeService: ThemeService,
    private sanitizeUrlService: SanitizeUrlService , 
    private lunarService: LunarService
    //private matIconRegistry: MatIconRegistry,
    //private domSanitizer: DomSanitizer
  ){
    //this.matIconRegistry.addSvgIcon(
      //'logo',
      //this.domSanitizer.bypassSecurityTrustResourceUrl('../Angular/website/src/assets/img/logo.svg')
    //)
  }

  toggleTheme(event: any) {
    const isDark = event.target.checked;
    this.themeService.setDarkMode(isDark);
  }

  sanitizeImageUrl(imageUrl: string) {
    return this.sanitizeUrlService.sanitizeUrl(imageUrl);
  }

  lunarDate = this.lunarService.getLunarDate(this.days);



  onChangeValue(event: Event) {
    //const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedName = (event.target as HTMLSelectElement).value; 
    // Find the full object from the array 
    const selectedProvince = this.provinces.find(p => p.name === selectedName);
    this.weather.getWeatherData(String(selectedProvince?.lat), String(selectedProvince?.lon))
    .subscribe(res =>{
      if (!res.status) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return this.temp = res.body.current.temp_c,
                this.icon = res.body.current.condition.icon;
    })

  
}

  // dung ngAfterViewInit de moi khi tai khung nhin ta thuc thi tim nap du lieu thoi tiet va cap nhat gia tri
   ngAfterViewInit(): void {

    this.weather.getWeatherData('10.7769', '106.7009')
      .subscribe(res => {
        if (!res.status) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return this.temp = res.body.current.temp_c,
                this.icon = res.body.current.condition.icon;        

        });

    if(this.lunarDate.month===12){
      switch(this.lunarDate.day){
        case 20: this.tetDay = `20 Tháng chạp `
        break;
        case 21: this.tetDay = `21 Tháng Chạp`
        break;
        case 22: this.tetDay = `22 Tháng Chạp`
        break;
        case 23: this.tetDay = `Ông Công Ông Táo`
        break;
        case 24: this.tetDay = `24 Tháng Chạp`
        break;
        case 25: this.tetDay = `25 Tháng Chạp`
        break;
        case 26: this.tetDay = `26 Tháng Chạp`
        break;
        case 27: this.tetDay = `27 Tháng Chạp`
        break;
        case 28: this.tetDay = `28 Tháng Chạp`
        break;
        case 29: this.tetDay = `Giao Thừa`
        break;
        default: this.tetDay = `${this.lunarDate.day}/${this.lunarDate.month}/${this.lunarDate.year}`;
      }
    } else if(this.lunarDate.month===1){
      switch(this.lunarDate.day){
        case 1: this.tetDay = `Mùng 1 Tết`
        break;
        case 2: this.tetDay = `Mùng 2 Tết`
        break;
        case 3: this.tetDay = `Mùng 3 Tết`
        break;
        default: this.tetDay = `${this.lunarDate.day}/${this.lunarDate.month}/${this.lunarDate.year}`;
      }
    } else{
      this.tetDay = `${this.lunarDate.day}/${this.lunarDate.month}/${this.lunarDate.year}`;
    }

    
  }


}


function esleIf() {
  throw new Error('Function not implemented.');
}

