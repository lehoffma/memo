import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PasswordRecoveryService} from "./password-recovery.service";
import {UserService} from "../../shared/services/api/user.service";
import {emailExistsValidator} from "../../shared/validators/email-exists.validator";
import {catchError} from "rxjs/operators";
import {of} from "rxjs";

@Component({
	selector: "memo-password-recovery",
	templateUrl: "./password-recovery.component.html",
	styleUrls: ["./password-recovery.component.scss"],
	providers: [PasswordRecoveryService]
})
export class PasswordRecoveryComponent implements OnInit {

	error = "";
	emailWasSent = false;
	loading = false;
	formGroup: FormGroup;

	constructor(private formBuilder: FormBuilder,
				private userService: UserService,
				private passwordRecoveryService: PasswordRecoveryService) {
	}

	ngOnInit() {
		this.formGroup = this.formBuilder.group({
			email: ["", {
				validators: [Validators.required, Validators.email],
				asyncValidators: [emailExistsValidator(this)]
			}]
		});
	}

	submit() {
		this.emailWasSent = false;
		this.error = "";
		this.loading = true;
		this.passwordRecoveryService.requestPasswordReset(this.formGroup.get("email").value)
			.pipe(
				catchError(error => {
					return of(true);
				})
			)
			.subscribe(
				wasSuccessful => {
					this.emailWasSent = true;
				},
				error => {
					if (error.status) {
						if (error.status === 404) {
							this.error = "Diese Email existiert nicht.";
							return;
						}
					}
					this.error = "Etwas ist schiefgelaufen."
				},
				() => this.loading = false
			)
	}

}
