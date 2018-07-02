import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {SignUpSubmitEvent} from "../signup-submit-event";
import {UserService} from "../../../shared/services/api/user.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {confirmPasswordValidator} from "../../../shared/validators/confirm-password.validator";
import {emailAlreadyTakenValidator} from "../../../shared/validators/email-already-taken.validator";


@Component({
	selector: "memo-account-data-form",
	templateUrl: "./account-data-form.component.html",
	styleUrls: ["./account-data-form.component.scss"]
})
export class AccountDataFormComponent implements OnInit {
	@Output() onSubmit = new EventEmitter<SignUpSubmitEvent>();

	accountDataForm: FormGroup;

	constructor(private userService: UserService,
				private formBuilder: FormBuilder,) {
		this.accountDataForm = this.formBuilder.group({
			"email": ["", {
				validators: [Validators.required, Validators.email],
				asyncValidators: emailAlreadyTakenValidator(this)
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
	}

	ngOnInit() {
	}

	submit() {
		this.onSubmit.emit({
			email: this.accountDataForm.get("email").value,
			password: this.accountDataForm.get("password").value
		});
	}
}
