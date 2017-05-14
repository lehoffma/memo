import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {DebitInputFormComponent} from "./debit-input-form.component";

describe("DebitInputFormComponent", () => {
	let component: DebitInputFormComponent;
	let fixture: ComponentFixture<DebitInputFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DebitInputFormComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DebitInputFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
