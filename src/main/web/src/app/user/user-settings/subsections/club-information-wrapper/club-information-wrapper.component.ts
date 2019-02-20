import {Component, OnInit} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {LogInService} from "../../../../shared/services/api/login.service";
import {AccountSettingsService} from "../account-settings.service";
import {FormBuilder, Validators} from "@angular/forms";

@Component({
	selector: "memo-club-information-wrapper",
	templateUrl: "./club-information-wrapper.component.html",
	styleUrls: ["./club-information-wrapper.component.scss"]
})
export class ClubInformationWrapperComponent extends BaseSettingsSubsectionComponent {
	constructor(protected loginService: LogInService,
				protected accountSettingsService: AccountSettingsService,
				private formBuilder: FormBuilder) {
		super(loginService, accountSettingsService);
		this.formGroup = this.formBuilder.group({
			"clubRole": ["", {
				validators: [Validators.required]
			}],
			"joinDate": ["", {
				validators: [Validators.required]
			}],
		});

		this.init();
	}
}
