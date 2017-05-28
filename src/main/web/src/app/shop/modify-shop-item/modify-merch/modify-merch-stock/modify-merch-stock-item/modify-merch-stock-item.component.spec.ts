import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyMerchStockItemComponent } from './modify-merch-stock-item.component';

describe('ModifyMerchStockItemComponent', () => {
  let component: ModifyMerchStockItemComponent;
  let fixture: ComponentFixture<ModifyMerchStockItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyMerchStockItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyMerchStockItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
