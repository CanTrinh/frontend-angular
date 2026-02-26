import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from './english';
import { EnglishService } from './english.service';
import { AppComponent } from '../app.component';
//import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-users',
  templateUrl: './english.component.html',
  imports: [ CommonModule, FormsModule,ReactiveFormsModule],
  providers: [EnglishService],
  styleUrls: ['./english.component.css']
})
export class EnglishComponent implements OnInit {
  condition= true;
  users: User[] = [];
  editUser: User | undefined; // the hero currently being edited
  userName = '';

  constructor(private usersService: EnglishService, private app: AppComponent) {};

 
  //showHero = this.app.toggleHeroes;
  
  //refeshPage = window.location.assign("http://localhost:4200/english");
  @ViewChild('userEditInput')
  set userEditInput(element: ElementRef<HTMLInputElement>) {
    if (element) {
      element.nativeElement.focus();
    }
  }

  ngOnInit() {
    this.getUsers();
  }

  getUsers(): void {
    this.usersService.getUsers()
      .subscribe(users => (this.users = users));
  }

  add(name: string): void {
    this.editUser = undefined;
    name = name.trim();
    if (!name) {
      return;
    }

    // The server will generate the id for this new hero
    const newUser: User = { name } as User;
    this.usersService
      .addUser(newUser)
      .subscribe(user => this.users.push(user));
  }

  delete(user: User): void {
    this.users = this.users.filter(h => h !== user);
    this.usersService
      .deleteUser(user.id)
      .subscribe();
    /*
    // oops ... subscribe() is missing so nothing happens
    this.heroesService.deleteHero(hero.id);
    */
  }

  edit(userName: string) {
    this.update(userName);
    this.editUser = undefined;
    
  }

  search(searchTerm: string) {
    this.editUser = undefined;
    if (searchTerm) {
      this.usersService
        .searchUsers(searchTerm)
        .subscribe(users => (this.users = users));
    } else {
      this.getUsers();
    }
  }

  update(userName: string) {
    if (userName && this.editUser && this.editUser.name !== userName) {
      this.usersService
        .updateUser({...this.editUser, name: userName})
        .subscribe(user => {
        // replace the hero in the heroes list with update from server
        const ix = user ? this.users.findIndex(h => h.id === user.id) : -1;
        if (ix > -1) {
          this.users[ix] = user;
        }
      });
      this.editUser = undefined;
    }
  }
}

