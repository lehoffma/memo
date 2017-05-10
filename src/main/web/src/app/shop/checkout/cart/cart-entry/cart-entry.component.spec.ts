import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CartEntryComponent } from './cart-entry.component';

describe('CartEntryComponent', () => {
  let component: CartEntryComponent;
  let fixture: ComponentFixture<CartEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
