import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbNavigationComponent } from './breadcrumb-navigation.component';

describe('BreadcrumbNavigationComponent', () => {
  let component: BreadcrumbNavigationComponent;
  let fixture: ComponentFixture<BreadcrumbNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BreadcrumbNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
