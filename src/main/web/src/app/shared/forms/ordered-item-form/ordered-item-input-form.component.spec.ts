import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderedItemInputFormComponent } from './ordered-item-input-form.component';

describe('OrderedItemInputFormComponent', () => {
  let component: OrderedItemInputFormComponent;
  let fixture: ComponentFixture<OrderedItemInputFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderedItemInputFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderedItemInputFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
