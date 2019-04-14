import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchModifyParticipantComponent } from './batch-modify-participant.component';

describe('BatchModifyParticipantComponent', () => {
  let component: BatchModifyParticipantComponent;
  let fixture: ComponentFixture<BatchModifyParticipantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchModifyParticipantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchModifyParticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
