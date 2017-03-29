import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ImageUploadPreviewComponent} from "./image-upload-preview.component";

describe('ImageUploadPreviewComponent', () => {
	let component: ImageUploadPreviewComponent;
	let fixture: ComponentFixture<ImageUploadPreviewComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageUploadPreviewComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageUploadPreviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
