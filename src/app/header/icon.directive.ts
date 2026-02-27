import { Directive, ElementRef, Input } from '@angular/core';
import { HeaderComponent } from './header.component';

@Directive({
  selector: '[appIcon]',
  standalone: true,
})
export class IconDirective {

  @Input() icon: HeaderComponent["icon"] | undefined;
  constructor(private img: ElementRef) { }
  
  addIcon (){
    this.img.nativeElement.setAttribute("src", `https:${this.icon}`)
  }


}
