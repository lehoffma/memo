import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {MultiLevelSelectComponent} from "./multi-level-select.component";

describe("MultiLevelSelectComponent", () => {
	let component: MultiLevelSelectComponent;
	let fixture: ComponentFixture<MultiLevelSelectComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MultiLevelSelectComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MultiLevelSelectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
