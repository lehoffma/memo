import {Component} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {FormBuilder, FormGroup} from "@angular/forms";
import {LogInService} from "../../../../shared/services/api/login.service";
import {AccountSettingsService} from "../account-settings.service";
import {User} from "../../../../shared/model/user";
import {of} from "rxjs";
import {MatSnackBar} from "@angular/material";

@Component({
	selector: "memo-profile-picture-wrapper",
	templateUrl: "./profile-picture-wrapper.component.html",
	styleUrls: ["./profile-picture-wrapper.component.scss"]
})
export class ProfilePictureWrapperComponent extends BaseSettingsSubsectionComponent {
	constructor(protected loginService: LogInService,
				protected accountSettingsService: AccountSettingsService,
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


	save(formGroup: FormGroup, user: User) {
		console.log(formGroup);
		return of(true);
	}
}
