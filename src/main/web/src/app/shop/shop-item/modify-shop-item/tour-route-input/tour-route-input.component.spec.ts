import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {TourRouteInputComponent} from "./tour-route-input.component";

describe("TourRouteInputComponent", () => {
	let component: TourRouteInputComponent;
	let fixture: ComponentFixture<TourRouteInputComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TourRouteInputComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TourRouteInputComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
