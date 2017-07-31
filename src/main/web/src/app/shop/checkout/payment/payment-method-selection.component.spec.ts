import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {PaymentMethodSelectionComponent} from "./payment-method-selection.component";

describe("PaymentMethodSelectionComponent", () => {
	let component: PaymentMethodSelectionComponent;
	let fixture: ComponentFixture<PaymentMethodSelectionComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PaymentMethodSelectionComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PaymentMethodSelectionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
