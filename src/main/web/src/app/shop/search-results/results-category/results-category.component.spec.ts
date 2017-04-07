import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ResultsCategoryComponent} from "./results-category.component";

describe("ResultsCategoryComponent", () => {
	let component: ResultsCategoryComponent;
	let fixture: ComponentFixture<ResultsCategoryComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ResultsCategoryComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ResultsCategoryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
