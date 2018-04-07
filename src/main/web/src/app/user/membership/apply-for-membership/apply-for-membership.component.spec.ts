import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyForMembershipComponent } from './apply-for-membership.component';

describe('ApplyForMembershipComponent', () => {
  let component: ApplyForMembershipComponent;
  let fixture: ComponentFixture<ApplyForMembershipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplyForMembershipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyForMembershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
