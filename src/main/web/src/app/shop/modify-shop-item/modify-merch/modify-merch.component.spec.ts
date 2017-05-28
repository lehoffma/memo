import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyMerchComponent } from './modify-merch.component';

describe('ModifyMerchComponent', () => {
  let component: ModifyMerchComponent;
  let fixture: ComponentFixture<ModifyMerchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyMerchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyMerchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
