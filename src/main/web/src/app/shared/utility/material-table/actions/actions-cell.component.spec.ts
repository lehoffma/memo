import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsCellComponent } from './actions-cell.component';

describe('ActionsCellComponent', () => {
  let component: ActionsCellComponent;
  let fixture: ComponentFixture<ActionsCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionsCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
