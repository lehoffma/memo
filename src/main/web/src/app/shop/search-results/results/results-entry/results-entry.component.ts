import {Component, Input, OnInit} from "@angular/core";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {Event} from "../../../shared/model/event";
import {MerchColor} from "../../../shared/model/merch-color";
import {StockService} from "../../../../shared/services/api/stock.service";
import {Discount} from "../../../../shared/renderers/price-renderer/discount";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {DiscountService} from "../../../shared/services/discount.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {defaultIfEmpty, filter, map, mergeMap} from "rxjs/operators";
import {Sort} from "../../../../shared/model/api/sort";
import {NOW} from "../../../../util/util";
import {isBefore} from "date-fns";

@Component({
	selector: "memo-results-entry",
	templateUrl: "./results-entry.component.html",
	styleUrls: ["./results-entry.component.scss"],
})
export class ResultsEntryComponent implements OnInit {
	constructor(private stockService: StockService,
				private discountService: DiscountService,
				private loginService: LogInService,
				private navigationService: NavigationService) {
	}

	_result: BehaviorSubject<Event> = new BehaviorSubject<Event>(null);

	colors$: Observable<MerchColor[]> = this._result
		.pipe(
			filter(result => this.resultIsMerch(result)),
			mergeMap(result => this.stockService.getByEventId(result.id, Sort.none())),
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
	resultUrl$ = this._result
		.pipe(
			map(result => {
				const itemType = EventUtilityService.getShopItemType(result);
				return `/${itemType}/${result.id}`;
			})
		);
	resultIsPast$ = this._result.pipe(
		map((result: Event) => {
			if(this.resultIsMerch(result)){
				return false;
			}
			return isBefore(result.date, NOW);
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
