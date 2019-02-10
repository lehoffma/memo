import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostPreviewComponent } from './cost-preview.component';

describe('CostPreviewComponent', () => {
  let component: CostPreviewComponent;
  let fixture: ComponentFixture<CostPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
