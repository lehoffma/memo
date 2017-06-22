import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCalendarContainerComponent } from './event-calendar-container.component';

describe('EventCalendarContainerComponent', () => {
  let component: EventCalendarContainerComponent;
  let fixture: ComponentFixture<EventCalendarContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventCalendarContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventCalendarContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
