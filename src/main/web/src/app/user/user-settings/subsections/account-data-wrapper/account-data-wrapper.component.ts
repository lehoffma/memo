import {Component} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {LogInService} from "../../../../shared/services/api/login.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {AccountSettingsService} from "../account-settings.service";

@Component({
	selector: "memo-account-data-wrapper",
	templateUrl: "./account-data-wrapper.component.html",
	styleUrls: ["./account-data-wrapper.component.scss"]
})
export class AccountDataWrapperComponent extends BaseSettingsSubsectionComponent {
	userDataForm: FormGroup = this.formBuilder.group({});

	constructor(protected loginService: LogInService,
				protected accountSettingsService: AccountSettingsService,
				private formBuilder: FormBuilder) {
		super(loginService, accountSettingsService);
		this.initFromUser$(this.userDataForm);
	}

}
