import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {SideNavComponent} from "./sidenav.component";

describe("ToolbarProfileLinkComponent", () => {
	let component: SideNavComponent;
	let fixture: ComponentFixture<SideNavComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SideNavComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SideNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
