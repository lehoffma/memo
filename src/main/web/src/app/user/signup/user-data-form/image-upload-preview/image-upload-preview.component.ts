import {Component, OnInit} from "@angular/core";

@Component({
	selector: "memo-image-upload-preview",
	templateUrl: "./image-upload-preview.component.html",
	styleUrls: ["./image-upload-preview.component.scss"]
})
export class ImageUploadPreviewComponent implements OnInit {
	file: string = "";

	constructor() {
	}

	ngOnInit() {
	}

	fileChange(event: any) {
		const files = event.target.files;

		if (files && files.length > 0) {
			const reader = new FileReader();

			reader.onload = () => {
				this.file = reader.result;
			};
			reader.readAsDataURL(files[0]);
		}

	}

}
