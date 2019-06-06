import {ChangeDetectionStrategy, Component} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {LogInService} from "../../../../shared/services/api/login.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AccountSettingsService} from "../account-settings.service";
import {UserService} from "../../../../shared/services/api/user.service";
import {confirmPasswordValidator} from "../../../../shared/validators/confirm-password.validator";
import {BehaviorSubject} from "rxjs";
import {takeUntil, tap} from "rxjs/operators";
import {MatSnackBar} from "@angular/material";
import {User} from "../../../../shared/model/user";

@Component({
	selector: "memo-account-data-wrapper",
	templateUrl: "./account-data-wrapper.component.html",
	styleUrls: ["./account-data-wrapper.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDataWrapperComponent extends BaseSettingsSubsectionComponent {
	wantsToChangePassword$ = new BehaviorSubject(false);

	get wantsToChangePassword() {
		return this.wantsToChangePassword$.getValue();
	}

	set wantsToChangePassword(it) {
		if (!it) {
			this.formGroup.get("password").reset();
			this.formGroup.get("confirmedPassword").reset();
		}
		this.wantsToChangePassword$.next(it);
	}

	constructor(protected loginService: LogInService,
				protected accountSettingsService: AccountSettingsService,
				protected snackBar: MatSnackBar,
				private userService: UserService,
				private formBuilder: FormBuilder) {
		super(loginService, snackBar, accountSettingsService);
		this.formGroup = this.formBuilder.group({
			"email": ["", {
				validators: [Validators.required, Validators.email]
			}],
			"password": ["", {
				validators: [Validators.required]
			}],
			"confirmedPassword": ["", {
				validators: [Validators.required]
			}]
		}, {
			validator: confirmPasswordValidator()
		});
		this.init();

		this.accountSettingsService.onReset.pipe(takeUntil(this.onDestroy$)).subscribe(it => this.wantsToChangePassword = false);
	}


	protected initFromUser(user: User, formGroup: FormGroup) {
		const value = formGroup.getRawValue();
		const updatedValue = value;

		Object.keys(value)
			.filter(key => !user.hasOwnProperty(key))
			.filter(key => key !== "password")
			.forEach(key => {
				if (value[key] instanceof Array) {
					updatedValue[key] = [];
				} else {
					updatedValue[key] = "";
				}
			});

		Object.keys(value)
			.filter(key => user.hasOwnProperty(key))
			.filter(key => key !== "password")
			.forEach(key => updatedValue[key] = user[key]);

		formGroup.setValue(updatedValue);
	}

	save(formGroup: FormGroup, user: User) {
		const updatedUser: User = {
			...user,
			email: formGroup.value.email,
			password: formGroup.value.password,
		};
		return this.userService.modify(updatedUser).pipe(
			tap(it => this.wantsToChangePassword = false),
		)
	}
}
