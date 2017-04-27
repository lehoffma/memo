import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ResultsEntryComponent} from "./results-entry.component";

describe("ResultsEntryComponent", () => {
	let component: ResultsEntryComponent;
	let fixture: ComponentFixture<ResultsEntryComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ResultsEntryComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ResultsEntryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
