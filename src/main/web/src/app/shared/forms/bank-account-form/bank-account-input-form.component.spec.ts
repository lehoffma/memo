import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountInputFormComponent } from './bank-account-input-form.component';

describe('BankAccountInputFormComponent', () => {
  let component: BankAccountInputFormComponent;
  let fixture: ComponentFixture<BankAccountInputFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountInputFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountInputFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
