import {Component} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LogInService} from "../../../../shared/services/api/login.service";
import {AccountSettingsService} from "../account-settings.service";
import {UserService} from "../../../../shared/services/api/user.service";
import {MatSnackBar} from "@angular/material";
import {User} from "../../../../shared/model/user";

@Component({
	selector: "memo-personal-data-wrapper",
	templateUrl: "./personal-data-wrapper.component.html",
	styleUrls: ["./personal-data-wrapper.component.scss"]
})
export class PersonalDataWrapperComponent extends BaseSettingsSubsectionComponent {
	constructor(protected loginService: LogInService,
				protected accountSettingsService: AccountSettingsService,
				protected snackBar: MatSnackBar,
				private userService: UserService,
				private formBuilder: FormBuilder) {
		super(loginService, snackBar, accountSettingsService);
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


	save(formGroup: FormGroup, user: User) {
		const updatedUser = {
			...user,
			...formGroup.value
		};

		return this.userService.modify(updatedUser);
	}
}
