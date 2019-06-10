import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyMerchStock2Component } from './modify-merch-stock2.component';

describe('ModifyMerchStock2Component', () => {
  let component: ModifyMerchStock2Component;
  let fixture: ComponentFixture<ModifyMerchStock2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyMerchStock2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyMerchStock2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
