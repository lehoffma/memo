import {Component, Input, OnInit} from "@angular/core";
import {FormArray} from "@angular/forms";

@Component({
	selector: "memo-discount-condition-form",
	templateUrl: "./discount-condition-form.component.html",
	styleUrls: ["./discount-condition-form.component.scss"]
})
export class DiscountConditionFormComponent implements OnInit {
	@Input() formArray: FormArray;

	constructor() {
	}

	ngOnInit() {
	}

	addControl() {
		console.warn("add control");
	}
}
