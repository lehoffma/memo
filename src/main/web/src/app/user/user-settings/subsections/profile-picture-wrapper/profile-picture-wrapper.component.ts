import {Component} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {FormBuilder} from "@angular/forms";
import {LogInService} from "../../../../shared/services/api/login.service";
import {AccountSettingsService} from "../account-settings.service";
import {User} from "../../../../shared/model/user";

@Component({
	selector: "memo-profile-picture-wrapper",
	templateUrl: "./profile-picture-wrapper.component.html",
	styleUrls: ["./profile-picture-wrapper.component.scss"]
})
export class ProfilePictureWrapperComponent extends BaseSettingsSubsectionComponent {
	constructor(protected loginService: LogInService,
				protected accountSettingsService: AccountSettingsService,
				private formBuilder: FormBuilder) {
		super(loginService, accountSettingsService);
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
}
