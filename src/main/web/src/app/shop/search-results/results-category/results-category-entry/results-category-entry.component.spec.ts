import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ResultsCategoryEntryComponent} from "./results-category-entry.component";

describe("ResultsCategoryEntryComponent", () => {
	let component: ResultsCategoryEntryComponent;
	let fixture: ComponentFixture<ResultsCategoryEntryComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ResultsCategoryEntryComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ResultsCategoryEntryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
