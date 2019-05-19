import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularSizesComponent } from './popular-sizes.component';

describe('PopularSizesComponent', () => {
  let component: PopularSizesComponent;
  let fixture: ComponentFixture<PopularSizesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopularSizesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopularSizesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
