import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemOrderInfoLinkComponent } from './item-order-info-link.component';

describe('ItemOrderInfoLinkComponent', () => {
  let component: ItemOrderInfoLinkComponent;
  let fixture: ComponentFixture<ItemOrderInfoLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemOrderInfoLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemOrderInfoLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
