import {Component, Input, OnInit} from "@angular/core";
import {Event, getDetailsTableKeys} from "../../../shared/model/event";
import {ShopItem} from "../../../../shared/model/shop-item";
import {TypeOfProperty} from "../../../../shared/model/util/type-of-property";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {MerchStockList} from "../../../shared/model/merch-stock";
import {StockService} from "../../../../shared/services/api/stock.service";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {BehaviorSubject, Observable} from "rxjs";
import {filter, map, mergeMap, share} from "rxjs/operators";
import {Sort} from "../../../../shared/model/api/sort";

@Component({
	selector: "memo-item-table",
	templateUrl: "./item-table.component.html",
	styleUrls: ["./item-table.component.scss"]
})
export class ItemTableComponent implements OnInit {

	values: {
		[key in keyof ShopItem]?: Observable<TypeOfProperty<ShopItem>>
	} = {};
	private _event$ = new BehaviorSubject<Event>(null);
	stock$: Observable<MerchStockList> = this._event$
		.pipe(
			filter(event => EventUtilityService.isMerchandise(event)),
			filter(event => event.id !== -1),
			mergeMap(event => this.stockService.getByEventId(event.id)),
			share()
		);
	tableCategories$ = this._event$.asObservable()
		.pipe(
			map(event => event.id === -1 ? [] : getDetailsTableKeys(event))
		);

	constructor(private stockService: StockService,
				private participantService: OrderedItemService) {
	}

	get event() {
		return this._event$.getValue();
	}

	@Input()
	set event(event: Event) {
		if (!this._event$.getValue() || this._event$.getValue().id !== event.id) {
			this._event$.next(event);
		}
	}

	ngOnInit() {
	}


	/**
	 *
	 * @param {string} key
	 * @returns {Observable<TypeOfProperty<ShopItem>>}
	 */
	getValue(key: string): Observable<TypeOfProperty<ShopItem>> {
		if (!this.values[key]) {
			//cache observable so we only have to query the value once
			if (EventUtilityService.isMerchandise(this.event) && key === "capacity") {
				this.values[key] = this.stock$
					.pipe(
						map(stock => stock.reduce((sum, it) => sum + it.amount, 0))
					);
			}
			else if (key === "emptySeats") {
				this.values[key] = this._event$
					.pipe(
						mergeMap(event =>
							this.participantService
								.getParticipantIdsByEvent(event.id, Sort.none())
								.pipe(
									map(participants => event.capacity - participants.length))
						)
					);
			}
			else {
				this.values[key] = this._event$
					.pipe(
						map(event => event[key])
					)
			}
		}
		return this.values[key];
	}
}
