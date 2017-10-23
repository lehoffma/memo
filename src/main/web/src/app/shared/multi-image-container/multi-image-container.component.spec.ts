import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MultiImageContainerComponent} from './multi-image-container.component';

describe('MultiImageContainerComponent', () => {
  let component: MultiImageContainerComponent;
  let fixture: ComponentFixture<MultiImageContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiImageContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiImageContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
