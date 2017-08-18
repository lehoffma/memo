import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from "@angular/core";
import {CropperSettings, ImageCropperComponent} from "ng2-image-cropper";

@Component({
	selector: "memo-profile-picture-form",
	templateUrl: "./profile-picture-form.component.html",
	styleUrls: ["./profile-picture-form.component.scss"]
})
export class ProfilePictureFormComponent implements OnInit, OnChanges {

	@Input() multiple: boolean = false;
	@Input() image;
	@Output() onChange = new EventEmitter<FormData>();
	@ViewChild("fileInput") inputEl: ElementRef;
	@ViewChild("cropper") cropper: ImageCropperComponent;

	data: any = {};
	imageCropperSettings: CropperSettings;

	constructor() {
		this.initImageCropperSettings();
	}

	ngOnInit() {
		let image = new Image();
		image.src = "resources/images/Logo.png";
		image.addEventListener("load", (data) => {
			this.cropper.setImage(image);
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		console.log(changes);
		if (changes["image"] && changes["image"].currentValue && !changes["image"].currentValue.toString().includes("resources")) {
			let image = new Image();
			if (this.image instanceof FormData) {
				this.image.getAll("file[]").forEach(string => console.log(string));
			}
			image.src = this.image + "?" + new Date().getTime();
			image.setAttribute("crossOrigin", "");
			image.addEventListener("load", (data) => {
				this.cropper.setImage(image);
			});
		}
	}

	initImageCropperSettings() {
		this.imageCropperSettings = new CropperSettings();
		this.imageCropperSettings.width = 200;
		this.imageCropperSettings.height = 200;

		this.imageCropperSettings.croppedWidth = 200;
		this.imageCropperSettings.croppedHeight = 200;

		this.imageCropperSettings.canvasWidth = 200;
		this.imageCropperSettings.canvasHeight = 200;

		this.imageCropperSettings.minWidth = 10;
		this.imageCropperSettings.minHeight = 10;

		this.imageCropperSettings.rounded = false;
		this.imageCropperSettings.keepAspect = true;
		this.imageCropperSettings.noFileInput = true;
	}

	emitFormData() {
		let inputEl: HTMLInputElement = this.inputEl.nativeElement;
		let fileCount: number = inputEl.files.length;
		let formData = new FormData();
		if (fileCount > 0) { // a file was selected
			for (let i = 0; i < fileCount; i++) {
				formData.append("file[]", inputEl.files.item(i));
			}
			this.onChange.emit(formData)
		}
	}

	updatePreview(event) {
		//todo emit event or image so the picture can be reconstructed
		if (event.target.files && event.target.files[0]) {
			console.log(event);
			const reader = new FileReader();
			let image = new Image();

			reader.onload = (event) => {
				image.src = (<any>event.target).result;
				this.image = (<any>event.target).result;
				this.cropper.setImage(image);
			};

			reader.readAsDataURL(event.target.files[0]);
		}
	}
}
