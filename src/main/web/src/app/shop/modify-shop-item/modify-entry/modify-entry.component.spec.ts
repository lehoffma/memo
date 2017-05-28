import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyEntryComponent } from './modify-entry.component';

describe('ModifyEntryComponent', () => {
  let component: ModifyEntryComponent;
  let fixture: ComponentFixture<ModifyEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
