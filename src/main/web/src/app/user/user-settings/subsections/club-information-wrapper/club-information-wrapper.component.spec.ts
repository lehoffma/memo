import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubInformationWrapperComponent } from './club-information-wrapper.component';

describe('ClubInformationWrapperComponent', () => {
  let component: ClubInformationWrapperComponent;
  let fixture: ComponentFixture<ClubInformationWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClubInformationWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubInformationWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
