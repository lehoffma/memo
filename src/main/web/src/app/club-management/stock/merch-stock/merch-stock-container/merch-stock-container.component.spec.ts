import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchStockContainerComponent } from './merch-stock-container.component';

describe('MerchStockContainerComponent', () => {
  let component: MerchStockContainerComponent;
  let fixture: ComponentFixture<MerchStockContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchStockContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchStockContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
