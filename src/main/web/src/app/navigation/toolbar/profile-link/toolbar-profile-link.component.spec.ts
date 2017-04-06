import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ToolbarProfileLinkComponent} from "./toolbar-profile-link.component";

describe("ToolbarProfileLinkComponent", () => {
	let component: ToolbarProfileLinkComponent;
	let fixture: ComponentFixture<ToolbarProfileLinkComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ToolbarProfileLinkComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ToolbarProfileLinkComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
