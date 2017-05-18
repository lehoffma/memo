import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ExpandableTableComponent} from "./expandable-table.component";

describe("ExpandableTableComponent", () => {
	let component: ExpandableTableComponent;
	let fixture: ComponentFixture<ExpandableTableComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ExpandableTableComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ExpandableTableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
