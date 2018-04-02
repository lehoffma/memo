import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderOptionsComponent } from './order-options.component';

describe('OrderOptionsComponent', () => {
  let component: OrderOptionsComponent;
  let fixture: ComponentFixture<OrderOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
