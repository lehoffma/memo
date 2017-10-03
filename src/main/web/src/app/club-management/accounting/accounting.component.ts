import {Component, OnInit} from "@angular/core";
import {Dimension, WindowService} from "../../shared/services/window.service";
import {AccountingTableContainerService} from "./accounting-table-container.service";

@Component({
	selector: "memo-accounting",
	templateUrl: "./accounting.component.html",
	styleUrls: ["./accounting.component.scss"],
	providers: [AccountingTableContainerService]
})
export class AccountingComponent implements OnInit {
	total$ = this.accountingTableContainerService.dataSubject$
		.map(entries => entries.reduce((acc, entry) => acc + entry.value, 0));

	showOptions = true;
	mobile = false;

	constructor(private windowService: WindowService,
				public accountingTableContainerService: AccountingTableContainerService) {

		this.windowService.dimension$
			.subscribe(dimensions => this.onResize(dimensions));
	}

	ngOnInit() {
	}

	/**
	 * Updates the columns and way the options are presented depending on the given width/height object
	 * @param {Dimension} dimension the current window dimensions
	 */
	onResize(dimension: Dimension) {
		let mobile = dimension.width < 850;
		this.showOptions = !mobile;
		this.mobile = mobile;
	}

}
