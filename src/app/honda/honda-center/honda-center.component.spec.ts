import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HondaCenterComponent } from './honda-center.component';

describe('HondaCenterComponent', () => {
  let component: HondaCenterComponent;
  let fixture: ComponentFixture<HondaCenterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HondaCenterComponent]
    });
    fixture = TestBed.createComponent(HondaCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
