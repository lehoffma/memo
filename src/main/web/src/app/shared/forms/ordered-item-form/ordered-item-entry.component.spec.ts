import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderedItemEntryComponent } from './ordered-item-entry.component';

describe('OrderedItemEntryComponent', () => {
  let component: OrderedItemEntryComponent;
  let fixture: ComponentFixture<OrderedItemEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderedItemEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderedItemEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
