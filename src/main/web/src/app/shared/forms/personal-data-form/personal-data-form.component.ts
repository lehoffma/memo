import {Component, Input, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {Gender} from "../../model/gender";
import {WindowService} from "../../services/window.service";

@Component({
	selector: "memo-personal-data-form",
	templateUrl: "./personal-data-form.component.html",
	styleUrls: ["./personal-data-form.component.scss"]
})
export class PersonalDataFormComponent implements OnInit {
	@Input() formGroup: FormGroup;
	maxDate: Date = new Date();
	genderOptions = [Gender.FEMALE, Gender.MALE, Gender.OTHER];

	isDesktop$ = this.windowService.hasMinDimensions(800);

	constructor(private windowService: WindowService) {
	}

	ngOnInit() {
	}

}
