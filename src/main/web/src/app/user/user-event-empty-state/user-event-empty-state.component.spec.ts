import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEventEmptyStateComponent } from './user-event-empty-state.component';

describe('UserEventEmptyStateComponent', () => {
  let component: UserEventEmptyStateComponent;
  let fixture: ComponentFixture<UserEventEmptyStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserEventEmptyStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEventEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
