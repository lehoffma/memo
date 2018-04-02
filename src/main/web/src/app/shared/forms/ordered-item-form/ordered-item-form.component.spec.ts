import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderedItemFormComponent } from './ordered-item-form.component';

describe('OrderedItemFormComponent', () => {
  let component: OrderedItemFormComponent;
  let fixture: ComponentFixture<OrderedItemFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderedItemFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderedItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
