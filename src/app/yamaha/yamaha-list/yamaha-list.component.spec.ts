import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YamahaListComponent } from './yamaha-list.component';

describe('YamahaListComponent', () => {
  let component: YamahaListComponent;
  let fixture: ComponentFixture<YamahaListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [YamahaListComponent]
    });
    fixture = TestBed.createComponent(YamahaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
