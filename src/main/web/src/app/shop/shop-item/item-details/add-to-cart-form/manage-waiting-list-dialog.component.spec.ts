import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageWaitingListDialogComponent } from './manage-waiting-list-dialog.component';

describe('ManageWaitingListDialogComponent', () => {
  let component: ManageWaitingListDialogComponent;
  let fixture: ComponentFixture<ManageWaitingListDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageWaitingListDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageWaitingListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
