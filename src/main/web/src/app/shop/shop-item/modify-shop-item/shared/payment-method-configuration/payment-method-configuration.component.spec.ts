import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodConfigurationComponent } from './payment-method-configuration.component';

describe('PaymentMethodConfigurationComponent', () => {
  let component: PaymentMethodConfigurationComponent;
  let fixture: ComponentFixture<PaymentMethodConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentMethodConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentMethodConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
