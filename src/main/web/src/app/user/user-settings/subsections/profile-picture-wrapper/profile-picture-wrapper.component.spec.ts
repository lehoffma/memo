import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePictureWrapperComponent } from './profile-picture-wrapper.component';

describe('ProfilePictureWrapperComponent', () => {
  let component: ProfilePictureWrapperComponent;
  let fixture: ComponentFixture<ProfilePictureWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilePictureWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePictureWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
