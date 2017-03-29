import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {SignUpSubmitEvent} from "../account-signup.component";

@Component({
	selector: 'memo-user-data-form',
	templateUrl: './user-data-form.component.html',
	styleUrls: ['./user-data-form.component.scss']
})
export class UserDataFormComponent implements OnInit {
	@Output() onSubmit = new EventEmitter<SignUpSubmitEvent>();

	constructor() {
	}

	ngOnInit() {
	}

	submit() {

	}

	imageUploaded(event) {
		console.log(event);
	}

}
