import {ChangeDetectionStrategy, Component} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {LogInService} from "../../../../shared/services/api/login.service";
import {FormBuilder, Validators} from "@angular/forms";
import {AccountSettingsService} from "../account-settings.service";
import {UserService} from "../../../../shared/services/api/user.service";
import {confirmPasswordValidator} from "../../../../shared/validators/confirm-password.validator";
import {BehaviorSubject, timer} from "rxjs";
import {first, takeUntil} from "rxjs/operators";

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
				private userService: UserService,
				private formBuilder: FormBuilder) {
		super(loginService, accountSettingsService);
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
}
