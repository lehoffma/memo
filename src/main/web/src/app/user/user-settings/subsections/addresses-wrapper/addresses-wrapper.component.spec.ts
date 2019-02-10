import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressesWrapperComponent } from './addresses-wrapper.component';

describe('AddressesWrapperComponent', () => {
  let component: AddressesWrapperComponent;
  let fixture: ComponentFixture<AddressesWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressesWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressesWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
