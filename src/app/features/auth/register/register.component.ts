import { Component} from '@angular/core';
import { CommonModule} from '@angular/common';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserRegister } from './user';
import { RegisterService } from'./register.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [RegisterService]
})
export class RegisterComponent {
    condition= true;
    userRegister: UserRegister[] = [];
    editUser: UserRegister | undefined; // the hero currently being edited
    name = '';
  

  pattern='^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$'
  userFormRe = this.formBuilder.group(
    {
      name: ['',[Validators.minLength(4), Validators.required]],
      email: ['', [Validators.email,Validators.required]],
      password: ['',[Validators.pattern(this.pattern),Validators.required]],
    }
  )

  
    constructor(private registerService: RegisterService, 
                private formBuilder: FormBuilder) {};

  
    add(): void {
      // The server will generate the id for this new user
      const data = this.userFormRe.value
      const newUser: UserRegister = data as UserRegister;
      this.registerService
        .addUser(newUser)
        //.subscribe(user => this.userRegister.push(user));
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
}

