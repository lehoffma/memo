import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupCompletedComponent } from './signup-completed.component';

describe('SignupCompletedComponent', () => {
  let component: SignupCompletedComponent;
  let fixture: ComponentFixture<SignupCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupCompletedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
