import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {AccountDataFormComponent} from "./account-data-form.component";

describe("AccountDataFormComponent", () => {
	let component: AccountDataFormComponent;
	let fixture: ComponentFixture<AccountDataFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AccountDataFormComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AccountDataFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
