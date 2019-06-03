import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPreviewRendererComponent } from './order-preview-renderer.component';

describe('OrderPreviewRendererComponent', () => {
  let component: OrderPreviewRendererComponent;
  let fixture: ComponentFixture<OrderPreviewRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderPreviewRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderPreviewRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
