import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {MultiLevelSelectEntryComponent} from "./multi-level-select-entry.component";

describe("MultiLevelSelectEntryComponent", () => {
	let component: MultiLevelSelectEntryComponent;
	let fixture: ComponentFixture<MultiLevelSelectEntryComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MultiLevelSelectEntryComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MultiLevelSelectEntryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
