import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterOptionHeaderComponent } from './filter-option-header.component';

describe('FilterOptionHeaderComponent', () => {
  let component: FilterOptionHeaderComponent;
  let fixture: ComponentFixture<FilterOptionHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterOptionHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterOptionHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
