import {Component} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {FormBuilder, Validators} from "@angular/forms";
import {LogInService} from "../../../../shared/services/api/login.service";
import {AccountSettingsService} from "../account-settings.service";

@Component({
	selector: "memo-personal-data-wrapper",
	templateUrl: "./personal-data-wrapper.component.html",
	styleUrls: ["./personal-data-wrapper.component.scss"]
})
export class PersonalDataWrapperComponent extends BaseSettingsSubsectionComponent {
	constructor(protected loginService: LogInService,
				protected accountSettingsService: AccountSettingsService,
				private formBuilder: FormBuilder) {
		super(loginService, accountSettingsService);
		this.formGroup = this.formBuilder.group({
			"firstName": ["", {
				validators: [Validators.required]
			}],
			"surname": ["", {
				validators: [Validators.required]
			}],
			"birthday": [undefined, {
				validators: [Validators.required]
			}],
			"gender": [undefined, {
				validators: [Validators.required]
			}],
			"telephone": ["", {
				validators: [Validators.pattern(/^[0-9\-+\s()]*$/)]
			}],
			"mobile": ["", {
				validators: [Validators.pattern(/^[0-9\-+\s()]*$/)]
			}],
			"isStudent": [false, {validators: []}],
			"hasSeasonTicket": [false, {validators: []}],
			"isWoelfeClubMember": [false, {validators: []}],
		});

		this.init();
	}
}
