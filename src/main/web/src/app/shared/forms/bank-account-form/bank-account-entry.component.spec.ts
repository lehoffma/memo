import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountEntryComponent } from './bank-account-entry.component';

describe('BankAccountEntryComponent', () => {
  let component: BankAccountEntryComponent;
  let fixture: ComponentFixture<BankAccountEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
