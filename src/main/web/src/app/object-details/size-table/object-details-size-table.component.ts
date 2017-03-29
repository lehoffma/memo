import {Component, Input, OnInit} from "@angular/core";
import {Merchandise} from "../../shared/model/merchandise";

@Component({
    selector: 'details-size-table',
    templateUrl: './object-details-size-table.component.html',
    styleUrls: ["./object-details-size-table.component.scss"]
})
export class DetailsSizeTableComponent implements OnInit {
	@Input() merch: Merchandise = new Merchandise();

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
