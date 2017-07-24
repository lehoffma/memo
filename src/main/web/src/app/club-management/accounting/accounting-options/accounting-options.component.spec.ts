import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingOptionsComponent } from './accounting-options.component';

describe('AccountingOptionsComponent', () => {
  let component: AccountingOptionsComponent;
  let fixture: ComponentFixture<AccountingOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountingOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
