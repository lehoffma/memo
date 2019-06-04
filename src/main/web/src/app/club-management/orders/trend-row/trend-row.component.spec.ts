import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendRowComponent } from './trend-row.component';

describe('TrendRowComponent', () => {
  let component: TrendRowComponent;
  let fixture: ComponentFixture<TrendRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
