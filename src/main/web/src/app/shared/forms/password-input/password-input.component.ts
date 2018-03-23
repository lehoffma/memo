import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";

@Component({
	selector: "memo-password-input",
	templateUrl: "./password-input.component.html",
	styleUrls: ["./password-input.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordInputComponent implements OnInit {
	@Input() form: FormGroup;
	@Input() repeatPassword: boolean = true;

	constructor() {
	}

	ngOnInit() {
	}

}
