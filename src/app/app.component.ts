import { AfterViewInit, Component, Inject, Input, } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { ConfigComponent } from './config/config.component';
import {CommonModule} from '@angular/common';
import { ChildrenOutletContexts, Routes } from '@angular/router';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { HondaListComponent } from './honda/honda-list/honda-list.component';
import { YamahaListComponent } from './yamaha/yamaha-list/yamaha-list.component';
//import { YamahaCenterModule } from './yamaha/yamaha-center.module';
import { YamahaCenterComponent } from './yamaha/yamaha-center/yamaha-center.component';
import { HondaDetailComponent } from './honda/honda-detail/honda-detail.component';
import { slideInAnimation } from './animations';
import { EnglishComponent } from './english/english.component';
import { LoginService } from './features/auth/login/login.service';



@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [HeaderComponent,
      RouterLink, RouterLinkActive, RouterOutlet,CommonModule],
    
})
export class AppComponent implements AfterViewInit{
    
  userLogin= 'Login';

  user: any;
  isLoggedIn = false;

  constructor(private loginService: LoginService) {}

  ngOnInit() {
    this.loginService.user$.subscribe(u => {
      this.user = u;
      this.isLoggedIn= true;
    });
    this.loginService.loadUserFromStorage(); // restore after refresh
  }

  logout() {
    this.loginService.logout();
  }


  snowflakes = Array.from({ length: 50 }, () => ({
    left: Math.random() * 100,
    duration: 5 + Math.random() * 5
  }));

  ngAfterViewInit(): void {
      const navParents = document.querySelectorAll(".parent");
      const navSubs = document.querySelectorAll(".sub");

      function handlePopup(a: Element, b: Element){
          a.addEventListener("mouseover", ()=> {
              b.removeAttribute("hidden");
          });
          
          a.addEventListener("mouseout", ()=> {
              b.setAttribute("hidden", "");
          });
      };

      for(let i=0; i < navParents.length; i++){
          for(let j=0; j< navSubs.length; j++){
              if(i===j){
                  handlePopup(navParents[i], navSubs[j]);
              }
          }
      }
  }

  showMenu =false;
  title = 'website';

  showEnglishes = false;
  //showConfig = false;
  //showDownloader = false;
  //showUploader = true;
  showSearch = true;
  toggleHeroes() { 
    this.showEnglishes = !this.showEnglishes;
   }
  //toggleConfig() { this.showConfig = !this.showConfig; }
  //toggleDownloader() { this.showDownloader = !this.showDownloader; }
  //toggleUploader() { this.showUploader = !this.showUploader; }
  toggleSearch() { this.showSearch = !this.showSearch; }


    
  }
