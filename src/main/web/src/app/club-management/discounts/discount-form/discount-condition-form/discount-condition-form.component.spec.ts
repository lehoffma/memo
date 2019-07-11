import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountConditionFormComponent } from './discount-condition-form.component';

describe('DiscountConditionFormComponent', () => {
  let component: DiscountConditionFormComponent;
  let fixture: ComponentFixture<DiscountConditionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscountConditionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountConditionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
