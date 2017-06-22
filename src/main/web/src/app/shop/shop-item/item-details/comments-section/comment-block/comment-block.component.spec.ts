import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentBlockComponent } from './comment-block.component';

describe('CommentBlockComponent', () => {
  let component: CommentBlockComponent;
  let fixture: ComponentFixture<CommentBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
