import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {MultiValueListExpandedRowComponent} from "./multi-value-list-expanded-row.component";

describe("MultiValueListExpandedRowComponent", () => {
	let component: MultiValueListExpandedRowComponent;
	let fixture: ComponentFixture<MultiValueListExpandedRowComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MultiValueListExpandedRowComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MultiValueListExpandedRowComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
