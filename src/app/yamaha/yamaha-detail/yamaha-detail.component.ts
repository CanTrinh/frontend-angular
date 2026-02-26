import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { xeYa } from '../yamaha';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { DialogService } from 'src/app/dialog.service';

@Component({
  selector: 'app-yamaha-detail',
  standalone: true,
  imports: [CommonModule, NgIf,FormsModule, AsyncPipe],
  templateUrl: './yamaha-detail.component.html',
  styleUrls: ['./yamaha-detail.component.css']
})
export class YamahaDetailComponent implements OnInit {
  xeya!: xeYa;
  editName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService
  ) {}

  ngOnInit() {
    this.route.data
      .subscribe(data => {
        const xeya: xeYa = data['xeya'];
        this.editName = xeya.name;
        this.xeya = xeya;
        console.log(data);
      });
    
  }

  cancel() {
    this.gotoXeYas();
  }

  save() {
    this.xeya.name = this.editName;
    this.gotoXeYas();
  }

  canDeactivate(): Observable<boolean> | boolean {
    // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged
    if (!this.xeya || this.xeya.name === this.editName) {
      return true;
    }
    // Otherwise ask the user with the dialog service and return its
    // observable which resolves to true or false when the user decides
    return this.dialogService.confirm('Discard changes?');
  }

  gotoXeYas() {
    const xeyaId = this.xeya ? this.xeya.id : null;
    // Pass along the crisis id if available
    // so that the CrisisListComponent can select that crisis.
    // Add a totally useless `foo` parameter for kicks.
    // Relative navigation back to the crises
    this.router.navigate(['../', { id: xeyaId, foo: 'foo' }], { relativeTo: this.route });
  }

}
