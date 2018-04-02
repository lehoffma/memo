import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountFormComponent } from './bank-account-form.component';

describe('BankAccountFormComponent', () => {
  let component: BankAccountFormComponent;
  let fixture: ComponentFixture<BankAccountFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
