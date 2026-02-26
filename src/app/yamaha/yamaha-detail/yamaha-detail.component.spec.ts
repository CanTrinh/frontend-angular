import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YamahaDetailComponent } from './yamaha-detail.component';

describe('YamahaDetailComponent', () => {
  let component: YamahaDetailComponent;
  let fixture: ComponentFixture<YamahaDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [YamahaDetailComponent]
    });
    fixture = TestBed.createComponent(YamahaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
