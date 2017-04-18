import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ParticipatedToursPreviewComponent} from "./participated-tours-preview.component";

describe("ParticipatedToursPreviewComponent", () => {
	let component: ParticipatedToursPreviewComponent;
	let fixture: ComponentFixture<ParticipatedToursPreviewComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ParticipatedToursPreviewComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ParticipatedToursPreviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
