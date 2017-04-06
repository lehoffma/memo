import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {CheckoutCartComponent} from "./cart.component";

describe("CartComponent", () => {
	let component: CheckoutCartComponent;
	let fixture: ComponentFixture<CheckoutCartComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CheckoutCartComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CheckoutCartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
