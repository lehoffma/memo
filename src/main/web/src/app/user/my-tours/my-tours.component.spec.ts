import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {MyToursComponent} from "./my-tours.component";

describe("MyToursComponent", () => {
	let component: MyToursComponent;
	let fixture: ComponentFixture<MyToursComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MyToursComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MyToursComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
