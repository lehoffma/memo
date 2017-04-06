import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {SignUpSubmitEvent} from "../signup-submit-event";
import {SignUpSection} from "../signup-section";

@Component({
	selector: "memo-user-data-form",
	templateUrl: "./user-data-form.component.html",
	styleUrls: ["./user-data-form.component.scss"]
})
export class UserDataFormComponent implements OnInit {
	@Output() onSubmit = new EventEmitter<SignUpSubmitEvent>();
	model = {
		firstName: undefined,
		surname: undefined,
		birthday: undefined,
		phoneNumber: undefined,
		isStudent: undefined
	};

	constructor() {
	}

	ngOnInit() {
	}

	submit() {
		this.onSubmit.emit({
			section: SignUpSection.PersonalData,
			firstName: this.model.firstName,
			surname: this.model.surname,
			birthday: this.model.birthday,
			phoneNumber: this.model.phoneNumber,
			isStudent: this.model.isStudent
		});
	}

	imageUploaded(event) {
		console.log(event);
	}

}
