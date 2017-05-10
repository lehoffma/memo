import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ToolbarElementComponent} from "./toolbar-element.component";

describe("ToolbarProfileLinkComponent", () => {
	let component: ToolbarElementComponent;
	let fixture: ComponentFixture<ToolbarElementComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ToolbarElementComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ToolbarElementComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
