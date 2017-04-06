import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {SignUpSubmitEvent} from "../signup-submit-event";
import {SignUpSection} from "../signup-section";

@Component({
	selector: "memo-account-data-form",
	templateUrl: "./account-data-form.component.html",
	styleUrls: ["./account-data-form.component.scss"]
})
export class AccountDataFormComponent implements OnInit {
	private userEmail: string;
	private password: string;
	private confirmedPassword: string;
	private passwordsMatch = true;
	@Output() onSubmit = new EventEmitter<SignUpSubmitEvent>();

	constructor() {
	}

	ngOnInit() {
	}

	submit() {
		this.onSubmit.emit({
			section: SignUpSection.AccountData,
			email: this.userEmail,
			//TODO calculate hash
			passwordHash: this.password
		});
	}
}
