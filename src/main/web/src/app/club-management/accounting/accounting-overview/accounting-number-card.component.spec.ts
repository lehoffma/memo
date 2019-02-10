import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingNumberCardComponent } from './accounting-number-card.component';

describe('AccountingNumberCardComponent', () => {
  let component: AccountingNumberCardComponent;
  let fixture: ComponentFixture<AccountingNumberCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountingNumberCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingNumberCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
