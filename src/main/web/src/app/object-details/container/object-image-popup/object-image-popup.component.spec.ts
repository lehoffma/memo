import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ObjectImagePopupComponent} from "./object-image-popup.component";

describe('ObjectImagePopupComponent', () => {
	let component: ObjectImagePopupComponent;
	let fixture: ComponentFixture<ObjectImagePopupComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ObjectImagePopupComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ObjectImagePopupComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
