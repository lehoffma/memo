import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ClubAdministrationComponent} from "./club-administration.component";

describe("ClubAdministrationComponent", () => {
	let component: ClubAdministrationComponent;
	let fixture: ComponentFixture<ClubAdministrationComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ClubAdministrationComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ClubAdministrationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
