import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YamahaCenterComponent } from './yamaha-center.component';

describe('YamahaCenterComponent', () => {
  let component: YamahaCenterComponent;
  let fixture: ComponentFixture<YamahaCenterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [YamahaCenterComponent]
    });
    fixture = TestBed.createComponent(YamahaCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
