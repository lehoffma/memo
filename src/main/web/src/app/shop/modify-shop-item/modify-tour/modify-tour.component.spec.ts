import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyTourComponent } from './modify-tour.component';

describe('ModifyTourComponent', () => {
  let component: ModifyTourComponent;
  let fixture: ComponentFixture<ModifyTourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyTourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
