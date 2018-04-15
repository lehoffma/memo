import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../../../../shared/utility/expandable-table/expandable-table-cell.component";
import {Gender} from "../../../../shared/model/gender";

@Component({
	selector: "td [genderTableCell]",
	template: `
		<span class="gender-container" [ngClass]="{'female': data === genderEnum.FEMALE}">{{germanData}}</span>
	`,
	styleUrls: ["./gender-cell.component.scss"]
})

export class GenderCellComponent implements OnInit, ExpandableTableCellComponent {
	genderEnum = Gender;
	@Input() data: Gender;
	germanData: string;

	constructor() {
	}

	ngOnInit() {
		this.germanData = this.getGermanData(this.data);
	}

	getGermanData(gender: Gender): string {
		switch (gender) {
			case Gender.MALE:
				return "Männlich";
			case Gender.FEMALE:
				return "Weiblich";
			case Gender.OTHER:
				return "Sonstiges";
		}
	}

}
