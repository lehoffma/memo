import {Component, Input, OnInit} from "@angular/core";
import {Merchandise} from "../../shared/model/merchandise";

@Component({
	selector: "memo-size-table",
	templateUrl: "./size-table.component.html",
	styleUrls: ["./size-table.component.scss"]
})
export class SizeTableComponent implements OnInit {
	@Input() merch: Merchandise = Merchandise.create();

	constructor() {
	}

	get clothesSizes(): string[] {
		return this.merch ? this.merch.clothesSizes : []
	}

	get sizeTableCategories(): string[] {
		return this.merch ? this.merch.sizeTableCategories : [];
	}

	ngOnInit() {
	}

}
