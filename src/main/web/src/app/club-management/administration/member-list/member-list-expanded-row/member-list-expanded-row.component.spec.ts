import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {MemberListExpandedRowComponent} from "./member-list-expanded-row.component";

describe("MemberListExpandedRowComponent", () => {
	let component: MemberListExpandedRowComponent;
	let fixture: ComponentFixture<MemberListExpandedRowComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MemberListExpandedRowComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MemberListExpandedRowComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
