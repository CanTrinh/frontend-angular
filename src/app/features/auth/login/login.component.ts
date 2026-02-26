/*
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule, FormArray,Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserSignIn } from './loginUser';
import { LoginService } from './login.service';
import { GraphQLService } from '../graphql.sercive';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService]
})
export class LoginComponent {
    condition= true;
    userRegister: UserSignIn[] = [];
    editUser: UserSignIn | undefined; // the hero currently being edited
    name = '';
    password = '';
    email = '';

  

  pattern='^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$'
  userFormRe = this.formBuilder.group(
    {
      name: ['',[Validators.minLength(4), Validators.required]],
      //email: ['', [Validators.email,Validators.required]],
      password: ['',[Validators.pattern(this.pattern),Validators.required]],
      //aliases: this.formBuilder.array([this.formBuilder.control('')]),
    }
  )
   

  getValueChanges(){
   this.userFormRe.valueChanges.subscribe(value => {
    //console.log('Form changed:', value);
    value;
  });}


  onSubmit() {
  // TODO: Use EventEmitter with form value
  return this.userFormRe.value;
  }
  
    constructor(private loginService: LoginService, 
                private app: AppComponent,
                private graphqlService: GraphQLService,
                private formBuilder: FormBuilder) {};

  
    ngOnInit() {
      this.getUsers();
    }
  
    getUsers(): void {
      this.loginService.getUser()
        .subscribe(users => (this.userRegister = users));
    }
  
    signIn(): void {

      const data = this.userFormRe.value
      const newUser:UserSignIn = data as UserSignIn;
      this.loginService
        .signINUser(newUser)
        .subscribe({
        next: (response) => {
          this.name = response.name;
          this.userFormRe.reset();
          console.log('User registered:', response);
        },
        error: (err) => {
          console.error('Registration failed:', err);
        }
        });
    }
}*/

// login.component.ts
import { Component, EventEmitter, Input, Output, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { RegisterUser } from './dto/registerUser.dto';
import { UserSignIn } from './dto/loginUser';
import { DialogService} from '../../../dialog.service'

@Component({
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, ],
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  isRegisterMode = false;

  loginForm: FormGroup;
  registerForm: FormGroup;
  nofi= '';
  errorMessage='';
  
  pattern='^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$'
  patternName='^[A-Za-z0-9]{4,}$'

  @Input() loginName!: string;
  @Output() loginNameChange =new EventEmitter<string>();
  constructor(private fb: FormBuilder,
             private loginService: LoginService,
            private router: Router,
            private dialog: DialogService
            ) {
    this.loginForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(this.patternName)]],
      password: ['', [Validators.required, Validators.pattern(this.pattern)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(this.patternName)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(this.pattern)]]
    });
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  onLogin(): void {
      const data = this.loginForm.value
      this.nofi ='';
      const User:UserSignIn = data as UserSignIn;
      this.loginService
        .signINUser(User)
        .subscribe(
        { 
          next: (res) => {
          /*this.loginName = response.name;
          this.loginNameChange.emit(this.loginName);
          this.nofi = "ban da login thanh cong";
          this.loginForm.reset();*/
          //localStorage.setItem('token', res.access_token);
          //localStorage.setItem('user', JSON.stringify(res.userInfor));
          //this.loginName = res.userInfor.name;
         
          this.loginForm.reset();
          this.router.navigateByUrl(`/home`);
          console.log('get recieve respond', res.access_token);
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 401) {
              this.errorMessage = 'Incorrect email or password.';
            } else if (err.status === 404) {
              this.errorMessage = 'Login service not found. Please try again later.';
            } else if (err.status === 500) {
              this.errorMessage = 'Server error. Please try again later.';
            } else {
              this.errorMessage = err.error?.message || 'Unexpected error occurred.';
            }
            this.loginForm.reset();
            console.error('Login failed:', err);
          }

        });
    }

  onRegister(): void {
      const data = this.registerForm.value
      this.nofi ='';
      const newUser:RegisterUser = data as RegisterUser;
      this.loginService
        .registerUser(newUser)
        .subscribe({
        next: (response) => {
          //this.loginName = response.name;
          //this.nofi = "Ban da dang ky thanh cong";
          this.registerForm.reset();
          this.dialog.confirm('Ban da dang ky thanh cong vui long login de dang nhap vao tai khoan cua ban');
          this.router.navigateByUrl(`/home`);
          //console.log('User registered:', response);
        },
        error: (err) => {
          console.error('Registration failed:', err);
          this.nofi = "Sai ten nguoi dung hoac password";
        }
        });
    }
}
