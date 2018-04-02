import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAutocompleteComponent } from './event-autocomplete.component';

describe('EventAutocompleteComponent', () => {
  let component: EventAutocompleteComponent;
  let fixture: ComponentFixture<EventAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
