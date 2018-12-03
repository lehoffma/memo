import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterOptionRowComponent } from './filter-option-row.component';

describe('FilterOptionRowComponent', () => {
  let component: FilterOptionRowComponent;
  let fixture: ComponentFixture<FilterOptionRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterOptionRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterOptionRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
