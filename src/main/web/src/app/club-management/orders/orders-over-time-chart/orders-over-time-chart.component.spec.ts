import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersOverTimeChartComponent } from './orders-over-time-chart.component';

describe('OrdersOverTimeChartComponent', () => {
  let component: OrdersOverTimeChartComponent;
  let fixture: ComponentFixture<OrdersOverTimeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdersOverTimeChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersOverTimeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
