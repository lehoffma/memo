import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ItemImagePopupComponent} from "./item-image-popup.component";

describe("ItemImagePopupComponent", () => {
	let component: ItemImagePopupComponent;
	let fixture: ComponentFixture<ItemImagePopupComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ItemImagePopupComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ItemImagePopupComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
