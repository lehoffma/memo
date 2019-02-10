import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingItemSummaryComponent } from './accounting-item-summary.component';

describe('AccountingItemSummaryComponent', () => {
  let component: AccountingItemSummaryComponent;
  let fixture: ComponentFixture<AccountingItemSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountingItemSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingItemSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
