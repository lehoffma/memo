import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDestinationRendererComponent } from './event-destination-renderer.component';

describe('EventDestinationRendererComponent', () => {
  let component: EventDestinationRendererComponent;
  let fixture: ComponentFixture<EventDestinationRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventDestinationRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDestinationRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
