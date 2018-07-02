import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {AddToCartFormComponent} from "./add-to-cart-form.component";

describe("AddToCartFormComponent", () => {
	let component: AddToCartFormComponent;
	let fixture: ComponentFixture<AddToCartFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AddToCartFormComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AddToCartFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
