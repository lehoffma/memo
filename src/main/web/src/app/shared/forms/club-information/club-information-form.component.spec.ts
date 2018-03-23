import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubInformationFormComponent } from './club-information-form.component';

describe('ClubInformationFormComponent', () => {
  let component: ClubInformationFormComponent;
  let fixture: ComponentFixture<ClubInformationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClubInformationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubInformationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
