import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchStockStatusChartComponent } from './merch-stock-status-chart.component';

describe('MerchStockStatusChartComponent', () => {
  let component: MerchStockStatusChartComponent;
  let fixture: ComponentFixture<MerchStockStatusChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchStockStatusChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchStockStatusChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
