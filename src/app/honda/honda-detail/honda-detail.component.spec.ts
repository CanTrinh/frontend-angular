import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HondaDetailComponent } from './honda-detail.component';

describe('HondaDetailComponent', () => {
  let component: HondaDetailComponent;
  let fixture: ComponentFixture<HondaDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HondaDetailComponent]
    });
    fixture = TestBed.createComponent(HondaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
