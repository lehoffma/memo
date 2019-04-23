import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemStatusComponent } from './order-item-status.component';

describe('OrderItemStatusComponent', () => {
  let component: OrderItemStatusComponent;
  let fixture: ComponentFixture<OrderItemStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderItemStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderItemStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
