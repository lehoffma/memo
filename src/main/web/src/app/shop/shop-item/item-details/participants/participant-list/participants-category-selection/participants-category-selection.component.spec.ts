import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantsCategorySelectionComponent } from './participants-category-selection.component';

describe('ParticipantsCategorySelectionComponent', () => {
  let component: ParticipantsCategorySelectionComponent;
  let fixture: ComponentFixture<ParticipantsCategorySelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipantsCategorySelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantsCategorySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
