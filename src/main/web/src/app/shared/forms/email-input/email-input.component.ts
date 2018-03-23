import {Component, Input, OnInit} from "@angular/core";
import {AbstractControl} from "@angular/forms";

@Component({
	selector: "memo-email-input",
	templateUrl: "./email-input.component.html",
	styleUrls: ["./email-input.component.scss"]
})
export class EmailInputComponent implements OnInit {
	@Input() form: AbstractControl;

	constructor() {
	}

	ngOnInit() {
	}
}
