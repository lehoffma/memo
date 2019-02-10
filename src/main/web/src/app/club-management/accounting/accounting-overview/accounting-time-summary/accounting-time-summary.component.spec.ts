import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingTimeSummaryComponent } from './accounting-time-summary.component';

describe('AccountingTimeSummaryComponent', () => {
  let component: AccountingTimeSummaryComponent;
  let fixture: ComponentFixture<AccountingTimeSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountingTimeSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingTimeSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
