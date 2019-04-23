import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemOrderInfoComponent } from './item-order-info.component';

describe('ItemOrderInfoComponent', () => {
  let component: ItemOrderInfoComponent;
  let fixture: ComponentFixture<ItemOrderInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemOrderInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemOrderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
