import {Component, Input, OnInit} from "@angular/core";
import {EventOverviewKey} from "../container/overview/event-overview-key";
import {Event} from "../../../shared/model/event";
import {ShopItem} from "../../../../shared/model/shop-item";
import {Observable} from "rxjs/Observable";
import {TypeOfProperty} from "../../../../shared/model/util/type-of-property";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {MerchStockList} from "../../../shared/model/merch-stock";
import {StockService} from "../../../../shared/services/api/stock.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ParticipantsService} from "../../../../shared/services/api/participants.service";

@Component({
	selector: "memo-item-table",
	templateUrl: "./item-table.component.html",
	styleUrls: ["./item-table.component.scss"]
})
export class ItemTableComponent implements OnInit {

	private _event$ = new BehaviorSubject<Event>(Event.create());

	get event() {
		return this._event$.getValue();
	}

	@Input()
	set event(event: Event) {
		if (this._event$.getValue().id !== event.id) {
			this._event$.next(event);
		}
	}

	stock$: Observable<MerchStockList> = this._event$
		.filter(event => EventUtilityService.isMerchandise(event))
		.filter(event => event.id !== -1)
		.flatMap(event => this.stockService.getByEventId(event.id))
		.share();

	values: {
		[key in keyof ShopItem]?: Observable<TypeOfProperty<ShopItem>>
		} = {};

	constructor(private stockService: StockService,
				private participantService: ParticipantsService) {
	}

	tableCategories$ = this._event$.asObservable()
		.map(event => event.id === -1 ? [] : event.detailsTableKeys);

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
					.map(stock => stock.reduce((sum, it) => sum + it.amount, 0));
			}
			else if (key === "emptySeats") {
				this.values[key] = this._event$
					.flatMap(event =>
						this.participantService.getParticipantIdsByEvent(event.id, EventUtilityService.getEventType(event))
							.map(participants => event.capacity - participants.length));
			}
			else {
				this.values[key] = this._event$
					.map(event => event[key]);
			}
		}
		return this.values[key];
	}
}
