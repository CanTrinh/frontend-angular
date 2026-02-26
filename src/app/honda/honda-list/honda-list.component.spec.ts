import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HondaListComponent } from './honda-list.component';

describe('HondaListComponent', () => {
  let component: HondaListComponent;
  let fixture: ComponentFixture<HondaListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HondaListComponent]
    });
    fixture = TestBed.createComponent(HondaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
