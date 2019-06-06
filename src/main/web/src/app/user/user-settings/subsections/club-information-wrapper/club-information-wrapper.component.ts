import {Component, OnInit} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {LogInService} from "../../../../shared/services/api/login.service";
import {AccountSettingsService} from "../account-settings.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {User} from "../../../../shared/model/user";
import {of} from "rxjs";
import {MatSnackBar} from "@angular/material";

@Component({
	selector: "memo-club-information-wrapper",
	templateUrl: "./club-information-wrapper.component.html",
	styleUrls: ["./club-information-wrapper.component.scss"]
})
export class ClubInformationWrapperComponent extends BaseSettingsSubsectionComponent {
	constructor(protected loginService: LogInService,
				protected accountSettingsService: AccountSettingsService,
				protected snackBar: MatSnackBar,
				private formBuilder: FormBuilder) {
		super(loginService, snackBar, accountSettingsService);
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



	save(formGroup: FormGroup, user: User) {
		console.log(formGroup);
		return of(true);
	}
}
