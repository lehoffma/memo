import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {MyToursEntryComponent} from "./my-tours-entry.component";

describe("MyToursEntryComponent", () => {
	let component: MyToursEntryComponent;
	let fixture: ComponentFixture<MyToursEntryComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MyToursEntryComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MyToursEntryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
