import {Component} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {FormBuilder, FormGroup} from "@angular/forms";
import {LogInService} from "../../../../shared/services/api/login.service";
import {AccountSettingsService} from "../account-settings.service";
import {User} from "../../../../shared/model/user";
import {Observable, of} from "rxjs";
import {MatSnackBar} from "@angular/material";
import {ImageUploadService} from "../../../../shared/services/api/image-upload.service";
import {processSequentially} from "../../../../util/observable-util";
import {ModifiedImages} from "../../../../shop/shop-item/modify-shop-item/modified-images";
import {map, switchMap, take} from "rxjs/operators";
import {setProperties} from "../../../../shared/model/util/base-object";
import {UserService} from "../../../../shared/services/api/user.service";

@Component({
	selector: "memo-profile-picture-wrapper",
	templateUrl: "./profile-picture-wrapper.component.html",
	styleUrls: ["./profile-picture-wrapper.component.scss"]
})
export class ProfilePictureWrapperComponent extends BaseSettingsSubsectionComponent {
	constructor(protected loginService: LogInService,
				protected accountSettingsService: AccountSettingsService,
				private imageService: ImageUploadService,
				private userService: UserService,
				protected snackBar: MatSnackBar,
				private formBuilder: FormBuilder) {
		super(loginService, snackBar, accountSettingsService);
		this.formGroup = this.formBuilder.group({
			"images": [[], {validators: []}],
			"imagesToUpload": [[], {validators: []}]
		});
		this.init()
	}

	hasChanges(user: User, value: { images: any[], imagesToUpload: any[] }): boolean {
		if (user.images && user.images.length > 0) {
			if (value.images.length === 0 && value.imagesToUpload.length === 0) {
				return true;
			}
		}

		return value.imagesToUpload && value.imagesToUpload.length > 0;
	}

	private deleteOldImages(imagePaths: string[], previousValue: User): Observable<any[]> {
		const previousImagePaths = previousValue.images;
		const imagesToDelete = previousImagePaths
			.filter(path => imagePaths.indexOf(path) === -1);

		if (imagesToDelete.length === 0) {
			return of([]);
		}

		return processSequentially(
			imagesToDelete
				.map(path => this.imageService.deleteImage(path))
		);
	}

	uploadImage(user: User, modifiedImages: ModifiedImages): Observable<User> {
		const {images, imagesToUpload} = modifiedImages;

		if (imagesToUpload && imagesToUpload.length > 0) {
			//todo: error handling, progress report
			let formData = new FormData();
			imagesToUpload.forEach(image => {
				const blob = this.imageService.dataURItoBlob(image.data);
				formData.append("file[]", blob, image.name);
			});

			return this.imageService.uploadImages(formData)
				.pipe(
					map(response => response.images),
					map(uploadedImages => setProperties(user, {images: [...images, ...uploadedImages]}))
				)

		}

		return of(setProperties(user, {images: [...images]}));
	}

	private handleImages(user: User, images: ModifiedImages): Observable<User> {
		return this.deleteOldImages(images.images, user)
			.pipe(
				switchMap(() => this.uploadImage(user, images))
			)
	}


	save(formGroup: FormGroup, user: User) {
		const modifiedImages = formGroup.value as ModifiedImages;
		return this.user$.pipe(
			take(1),
			switchMap(user => this.handleImages(user, modifiedImages)),
			switchMap(user => this.userService.modify(user))
		);
	}
}
