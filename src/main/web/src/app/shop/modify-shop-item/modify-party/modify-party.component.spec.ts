import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyPartyComponent } from './modify-party.component';

describe('ModifyPartyComponent', () => {
  let component: ModifyPartyComponent;
  let fixture: ComponentFixture<ModifyPartyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyPartyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
