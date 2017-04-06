import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {AddressCheckComponent} from "./address-check.component";

describe("AddressCheckComponent", () => {
	let component: AddressCheckComponent;
	let fixture: ComponentFixture<AddressCheckComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AddressCheckComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AddressCheckComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
