import {Component, Input, OnInit} from "@angular/core";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {Event} from "../../../shared/model/event";
import {MerchColor} from "../../../shared/model/merch-color";
import {StockService} from "../../../../shared/services/api/stock.service";
import {Discount} from "../../../../shared/renderers/price-renderer/discount";
import {Observable} from "rxjs/Observable";
import {DiscountService} from "../../../shared/services/discount.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {defaultIfEmpty, filter, map, mergeMap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";

@Component({
	selector: "memo-results-entry",
	templateUrl: "./results-entry.component.html",
	styleUrls: ["./results-entry.component.scss"],
})
export class ResultsEntryComponent implements OnInit {
	_result: BehaviorSubject<Event> = new BehaviorSubject<Event>(null);
	colors$: Observable<MerchColor[]> = this._result
		.pipe(
			filter(result => this.resultIsMerch(result)),
			mergeMap(result => this.stockService.getByEventId(result.id)),
			map(stockList => stockList.map(stockItem => stockItem.color)),
			//remove duplicates
			map(colors => colors.filter((color, index, array) => array.findIndex(it => it.name === color.name) === index)),
			defaultIfEmpty([])
		);
	discounts$: Observable<Discount[]> =
		combineLatest(
			this.loginService.accountObservable,
			this._result
		)
			.pipe(
				mergeMap(([accountId, result]) => this.discountService.getEventDiscounts(result.id, accountId))
			);

	constructor(private stockService: StockService,
				private discountService: DiscountService,
				private loginService: LogInService,
				private navigationService: NavigationService) {
	}

	resultUrl$ = this._result
		.pipe(
			map(result => {
				const itemType = EventUtilityService.getShopItemType(result)
				return `/${itemType}/${result.id}`;
			})
		);

	get result() {
		return this._result.getValue();
	}

	@Input()
	set result(result: Event) {
		this._result.next(result);
	}

	ngOnInit() {
	}

	resultIsMerch(result: Event) {
		return EventUtilityService.isMerchandise(result);
	}

}
