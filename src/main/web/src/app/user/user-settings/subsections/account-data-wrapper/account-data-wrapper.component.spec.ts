import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDataWrapperComponent } from './account-data-wrapper.component';

describe('AccountDataWrapperComponent', () => {
  let component: AccountDataWrapperComponent;
  let fixture: ComponentFixture<AccountDataWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountDataWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDataWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
