import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDataWrapperComponent } from './personal-data-wrapper.component';

describe('PersonalDataWrapperComponent', () => {
  let component: PersonalDataWrapperComponent;
  let fixture: ComponentFixture<PersonalDataWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalDataWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalDataWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
