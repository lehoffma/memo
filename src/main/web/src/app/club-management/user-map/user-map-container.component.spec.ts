import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMapContainerComponent } from './user-map-container.component';

describe('UserMapContainerComponent', () => {
  let component: UserMapContainerComponent;
  let fixture: ComponentFixture<UserMapContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserMapContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMapContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
