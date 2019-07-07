import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountGridItemComponent } from './discount-grid-item.component';

describe('DiscountGridItemComponent', () => {
  let component: DiscountGridItemComponent;
  let fixture: ComponentFixture<DiscountGridItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscountGridItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountGridItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
