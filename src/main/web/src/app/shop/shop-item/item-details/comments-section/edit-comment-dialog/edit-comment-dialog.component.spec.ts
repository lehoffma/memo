import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {EditCommentDialogComponent} from "./edit-comment-dialog.component";

describe("EditCommentDialogComponent", () => {
	let component: EditCommentDialogComponent;
	let fixture: ComponentFixture<EditCommentDialogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EditCommentDialogComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EditCommentDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should be created", () => {
		expect(component).toBeTruthy();
	});
});
