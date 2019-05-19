import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularColorsComponent } from './popular-colors.component';

describe('PopularColorsComponent', () => {
  let component: PopularColorsComponent;
  let fixture: ComponentFixture<PopularColorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopularColorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopularColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
