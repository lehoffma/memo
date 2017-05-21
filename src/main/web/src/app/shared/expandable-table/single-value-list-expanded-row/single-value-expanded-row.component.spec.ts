import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {SingleValueListExpandedRowComponent} from "./single-value-list-expanded-row.component";

describe("SingleValueListExpandedRowComponent", () => {
	let component: SingleValueListExpandedRowComponent;
	let fixture: ComponentFixture<SingleValueListExpandedRowComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SingleValueListExpandedRowComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SingleValueListExpandedRowComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
