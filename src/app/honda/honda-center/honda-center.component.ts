import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-honda-center',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './honda-center.component.html',
  styleUrls: ['./honda-center.component.css']
})
export class HondaCenterComponent {

}
