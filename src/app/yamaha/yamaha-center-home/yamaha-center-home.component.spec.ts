import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YamahaCenterHomeComponent } from './yamaha-center-home.component';

describe('YamahaCenterHomeComponent', () => {
  let component: YamahaCenterHomeComponent;
  let fixture: ComponentFixture<YamahaCenterHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [YamahaCenterHomeComponent]
    });
    fixture = TestBed.createComponent(YamahaCenterHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
