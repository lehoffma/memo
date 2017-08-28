import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {SignUpSubmitEvent} from "../signup-submit-event";
import {SignUpSection} from "../signup-section";
import {UserService} from "../../../shared/services/api/user.service";

@Component({
	selector: "memo-account-data-form",
	templateUrl: "./account-data-form.component.html",
	styleUrls: ["./account-data-form.component.scss"]
})
export class AccountDataFormComponent implements OnInit {
	public userEmail: string;
	public password: string;
	public confirmedPassword: string;
	public passwordsMatch = true;
	public emailIsAlreadyUsed = false;
	public loading = false;
	@Output() onSubmit = new EventEmitter<SignUpSubmitEvent>();

	constructor(private userService: UserService) {
	}

	ngOnInit() {
	}

	submit() {
		this.loading = true;
		this.userService.isUserEmailAlreadyInUse(this.userEmail)
			.subscribe(isAlreadyInUse => {
				this.loading = false;
				if (!isAlreadyInUse) {
					this.onSubmit.emit({
						section: SignUpSection.AccountData,
						email: this.userEmail,
						//TODO calculate hash?
						passwordHash: this.password
					});
				}
				else {
					this.emailIsAlreadyUsed = true;
				}
			})

	}
}
