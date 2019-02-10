import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingOverviewComponent } from './accounting-overview.component';

describe('AccountingOverviewComponent', () => {
  let component: AccountingOverviewComponent;
  let fixture: ComponentFixture<AccountingOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountingOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
