import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ItemInfoHeaderComponent} from "./item-info-header.component";

describe("ItemInfoHeaderComponent", () => {
	let component: ItemInfoHeaderComponent;
	let fixture: ComponentFixture<ItemInfoHeaderComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ItemInfoHeaderComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ItemInfoHeaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
