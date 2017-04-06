import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {AccountingEntryComponent} from "./accounting-entry.component";

describe("AccountingEntryComponent", () => {
	let component: AccountingEntryComponent;
	let fixture: ComponentFixture<AccountingEntryComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AccountingEntryComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AccountingEntryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
