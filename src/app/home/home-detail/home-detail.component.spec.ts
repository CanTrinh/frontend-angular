import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDetailComponent } from './home-detail.component';

describe('HomeDetailComponent', () => {
  let component: HomeDetailComponent;
  let fixture: ComponentFixture<HomeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeDetailComponent]
    });
    fixture = TestBed.createComponent(HomeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
