import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ChooseColorComponent} from "./choose-color.component";

describe("ChooseColorComponent", () => {
	let component: ChooseColorComponent;
	let fixture: ComponentFixture<ChooseColorComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ChooseColorComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ChooseColorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
