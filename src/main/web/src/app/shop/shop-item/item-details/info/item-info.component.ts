import {Component, Input, OnInit} from "@angular/core";
import {Event} from "../../../shared/model/event";
import {ShoppingCartService} from "../../../../shared/services/shopping-cart.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {StockService} from "../../../../shared/services/api/stock.service";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {defaultIfEmpty, filter, map, mergeMap} from "rxjs/operators";
import {LogInService} from "../../../../shared/services/api/login.service";
import {Discount} from "../../../../shared/renderers/price-renderer/discount";
import {DiscountService} from "../../../shared/services/discount.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import {EventService} from "../../../../shared/services/api/event.service";
import {CapacityService, EventCapacity} from "../../../../shared/services/api/capacity.service";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {WaitingListService} from "../../../../shared/services/api/waiting-list.service";
import {WaitingListEntry} from "../../../shared/model/waiting-list";
import {AddressService} from "../../../../shared/services/api/address.service";
import {Address} from "../../../../shared/model/address";

@Component({
	selector: "memo-item-info",
	templateUrl: "./item-info.component.html",
	styleUrls: ["./item-info.component.scss"]
})
export class ItemInfoComponent implements OnInit {
	_event$: BehaviorSubject<Event> = new BehaviorSubject(undefined);
	@Input() permissions: {
		checkIn: boolean;
		edit: boolean;
		conclude: boolean;
		waitingList: boolean;
		entries: boolean;
		delete: boolean;
	};
	discounts$: Observable<Discount[]> =
		combineLatest([
			this._event$,
			this.loginService.accountObservable
				.pipe(defaultIfEmpty(-1))
		])
			.pipe(
				mergeMap(([event, userId]) => this.discountService.getEventDiscounts(event.id, userId)),
				defaultIfEmpty([]),
			);

	discountPossibilities$: Observable<Discount[]> =
		combineLatest([
			this._event$,
			this.loginService.accountObservable
				.pipe(defaultIfEmpty(-1))
		])
			.pipe(
				mergeMap(([event, userId]) => this.discountService.getEventDiscountPossibilities(event.id, userId)),
				defaultIfEmpty([]),
			);
	public available$ = this._event$
		.pipe(
			filter(event => event.id >= 0),
			mergeMap(event => this.capacityService.valueChanges<EventCapacity>(event.id)),
			filter(it => it !== null),
			map(it => it.capacity)
		);

	public waitingList$ = this._event$.pipe(
		filter(event => event.id >= 0),
		mergeMap(event => this.waitingListService.valueChanges<WaitingListEntry[]>(event.id, "search", this.waitingListService.getAllByEventId.bind(this.waitingListService))),
		filter(it => it !== null),
		map(it => it.reduce((sum, entry) => sum + 1, 0))
	);
	destination$: Observable<Address> = this._event$.pipe(
		filter(event => event.id >= 0),
		filter(event => !this.isMerch(event)),
		mergeMap(event => this.addressService.getById(event.route[event.route.length - 1]))
	);
	tour$: Observable<Address[]> = this._event$.pipe(
		filter(event => event.id >= 0),
		filter(event => this.isTour(event)),
		mergeMap(event => combineLatest(
			...event.route.map(id => this.addressService.getById(id))
		))
	);

	constructor(private participantService: OrderedItemService,
				private waitingListService: WaitingListService,
				private discountService: DiscountService,
				private addressService: AddressService,
				private stockService: StockService,
				private loginService: LogInService,
				private navigationService: NavigationService,
				private shoppingCartService: ShoppingCartService,
				private eventService: EventService,
				private snackBar: MatSnackBar,
				private capacityService: CapacityService) {
	}

	get event() {
		return this._event$.getValue();
	}

	@Input()
	set event(event: Event) {
		this._event$.next(event);
	}


	ngOnInit() {
	}


	isMerch(item) {
		return EventUtilityService.isMerchandise(item);
	}

	isTour(item) {
		return EventUtilityService.isTour(item);
	}
}
