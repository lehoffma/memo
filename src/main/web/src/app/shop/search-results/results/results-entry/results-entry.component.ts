import {Component, Input, OnInit} from "@angular/core";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {Event} from "../../../shared/model/event";
import {MerchColor} from "../../../shared/model/merch-color";
import {StockService} from "../../../../shared/services/api/stock.service";

@Component({
	selector: "memo-results-entry",
	templateUrl: "./results-entry.component.html",
	styleUrls: ["./results-entry.component.scss"],
})
export class ResultsEntryComponent implements OnInit {
	colors: MerchColor[] = [];

	constructor(private stockService: StockService,
				private navigationService: NavigationService) {
	}

	_result: Event;

	get result() {
		return this._result;
	}

	@Input()
	set result(result: Event) {
		this._result = result;
		if (this.resultIsMerch(result)) {
			this.stockService
				.getByEventId(result.id)
				.map(stockList => stockList.map(stockItem => stockItem.color))
				//remove duplicates
				.map(colors => colors.filter((color, index, array) => array.findIndex(it => it.name === color.name) === index))
				.subscribe(colors => this.colors = [...colors]);
		}
	}

	ngOnInit() {
	}

	resultIsMerch(result: Event) {
		return EventUtilityService.isMerchandise(result);
	}

	showResult(result: Event) {
		this.navigationService.navigateToItemWithId(EventUtilityService.getShopItemType(result), result.id);
	}

}
