import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {Event, maximumItemAmount} from "../../../shared/model/event";
import {Tour} from "../../../shared/model/tour";
import {Merchandise} from "../../../shared/model/merchandise";
import {MerchStock, MerchStockList} from "../../../shared/model/merch-stock";
import {defaultIfEmpty, distinctUntilChanged, filter, map, mergeMap, take, tap} from "rxjs/operators";
import {ShoppingCartOption} from "../../../../shared/model/shopping-cart-item";
import {MerchColor} from "../../../shared/model/merch-color";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {isBefore} from "date-fns";
import {ObservableCache} from "../../../../shared/cache/observable-cache";
import {TypeOfProperty} from "../../../../shared/model/util/type-of-property";
import {Sort} from "../../../../shared/model/api/sort";
import {ShoppingCartService} from "../../../../shared/services/shopping-cart.service";
import {CapacityService, EventCapacity} from "../../../../shared/services/api/capacity.service";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {StockService} from "../../../../shared/services/api/stock.service";
import {WaitingListService} from "../../../../shared/services/api/waiting-list.service";
import {WaitingListEntry} from "../../../shared/model/waiting-list";
import {LogInService} from "../../../../shared/services/api/login.service";
import {MatDialog} from "@angular/material";
import {ManageWaitingListDialogComponent} from "./manage-waiting-list-dialog.component";
import {integerToType} from "../../../shared/model/event-type";
import {isEdited} from "../../../../util/util";

@Component({
	selector: "memo-add-to-cart-form",
	templateUrl: "./add-to-cart-form.component.html",
	styleUrls: ["./add-to-cart-form.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddToCartFormComponent implements OnInit {
	private _event$: BehaviorSubject<Event> = new BehaviorSubject<Event>(null);
	stock$: Observable<MerchStockList> = this._event$
		.pipe(
			filter(event => EventUtilityService.isMerchandise(event)),
			filter(event => event.id !== -1),
			mergeMap(event => this.stockService.getByEventId(event.id))
		);

	@Input() permissions: {
		checkIn: boolean;
		edit: boolean;
		conclude: boolean;
		entries: boolean;
		delete: boolean;
	};

	public colorSelection$: Observable<MerchColor[]> = this.getColorSelection("");
	_color$: BehaviorSubject<MerchColor> = new BehaviorSubject(undefined);
	public sizeSelection$: Observable<string[]> = this._color$
		.pipe(
			mergeMap(color => this.getSizeSelection(color))
		);
	_size$: BehaviorSubject<string> = new BehaviorSubject(undefined);


	public maxAmount$: Observable<number> = this._event$
		.pipe(
			filter(event => event && event.id >= 0),
			distinctUntilChanged((x, y) => x.id === y.id),
			mergeMap(event => (this.isMerch(event)
				? this.getStockAmount$()
				: (<Observable<number>>this.getValue("capacity"))).pipe(map(it => maximumItemAmount(event, it)))
			),
			distinctUntilChanged(),
		);

	public amountOptions$: Observable<number[]> = this.maxAmount$
		.pipe(
			//fills the amountOptions variable with integers from 0 to maxAmount
			map(maxAmount => Array((maxAmount === undefined) ? 0 : maxAmount + 1).fill(0).map((_, i) => i)),
			distinctUntilChanged(),
		);


	model = {
		amount: 0
	};

	public isPastEvent$: Observable<boolean> = this._event$
		.pipe(
			map(event => (event && event.id !== -1 && isBefore(event.date, new Date())))
		);

	isSoldOut$ = combineLatest(
		this._event$,
		this._size$,
		this._color$,
		this.amountOptions$
	).pipe(
		map(([event, size, color, options]) => this.isSoldOut(event, options, color, size))
	);

	waitingList$: Observable<WaitingListEntry[]> = this._event$.pipe(
		mergeMap(event => this.waitingListService.valueChanges(event.id, "search", this.waitingListService.getAllByEventId.bind(this.waitingListService))),
	);

	waitingListEntryOfUser$: Observable<WaitingListEntry[]> = combineLatest(
		this.loginService.currentUser$,
		this.waitingList$,
		this._color$,
		this._size$
	).pipe(
		map(([user, waitingList, color, size]) => {
			console.log(waitingList);
			if (!waitingList || !user) {
				return [];
			}

			return waitingList.filter(entry =>
				((!color && !entry.color) || (color && entry.color && color.hex === entry.color.hex))
				&& ((!size && !entry.size) || (size === entry.size))
				&& +entry.user === user.id
			);
		}),
	);

	isPartOfWaitingList$ = this.waitingListEntryOfUser$.pipe(
		map(entries => entries.length > 0)
	);

	private _cache: ObservableCache<number> = new ObservableCache<number>()
		.withAsyncFallback("capacity", () => this._event$
			.pipe(
				filter(event => event.id >= 0),
				mergeMap(event => this.capacityService.valueChanges<EventCapacity>(event.id)),
				filter(it => it !== null),
				map(it => it.capacity)
			)
		)
		.withAsyncFallback("emptySeats", () => this.getEmptySeats$());
	private removedFromWaitingList: boolean = false;


	constructor(private participantService: OrderedItemService,
				private shoppingCartService: ShoppingCartService,
				private waitingListService: WaitingListService,
				private matDialog: MatDialog,
				private loginService: LogInService,
				private stockService: StockService,
				private capacityService: CapacityService) {
		this.updateMaxAmount();
	}

	get event() {
		return this._event$.getValue();
	}

	@Input()
	set event(event: Event) {
		this._event$.next(event);
	}

	get color() {
		return this._color$.getValue();
	}

	set color(color: MerchColor) {
		this._color$.next(color);
	}

	get size() {
		return this._size$.getValue();
	}

	set size(size: string) {
		this._size$.next(size);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}


	/**
	 * Updates maxAmount and amountOptions (i.e. the amount-dropdown)
	 */
	updateMaxAmount() {
		this.amountOptions$ = this.maxAmount$
			.pipe(
				//fills the amountOptions variable with integers from 0 to maxAmount
				map(maxAmount => Array((maxAmount === undefined) ? 0 : maxAmount + 1).fill(0).map((_, i) => i)),
			);
	}


	/**
	 *
	 * @param {T} selectedValue
	 * @param {(value: T) => U} valueId
	 * @param {(value: MerchStock) => U} getValueFromStock
	 * @param {(value: MerchStock) => V} getSelectionValue
	 * @param {(value: V) => W} selectionValueId
	 * @returns {Observable<V[]>}
	 */
	private getSelection$<T, U, V, W>(
		selectedValue: T,
		valueId: (value: T) => U,
		getValueFromStock: (value: MerchStock) => U,
		getSelectionValue: (value: MerchStock) => V,
		selectionValueId: (value: V) => W
	) {
		return this.stock$
			.pipe(
				map((stock: MerchStockList) => {
					return stock
					//remove values that aren't possible with the current size selection
						.filter(stockItem => !selectedValue ? true : getValueFromStock(stockItem) === valueId(selectedValue))
						.map(stockItem => getSelectionValue(stockItem))
						//remove duplicates
						.filter((_value, index, array) => array
							.findIndex(it => selectionValueId(_value) === selectionValueId(it)) === index);
				})
			);
	}


	/**
	 *
	 * @param {string} key
	 * @returns {Observable<TypeOfProperty<ShopItem>>}
	 */
	getValue(key: keyof Event): Observable<TypeOfProperty<Event>> {
		return this._cache.get(key);
	}

	/**
	 *
	 * @param {Merchandise} merch
	 * @param {string} size
	 * @returns {Observable<MerchColor[]>}
	 */
	getColorSelection(size: string): Observable<MerchColor[]> {
		return this.getSelection$(size,
			it => it, it => it.size, it => it.color, it => it.name
		);
	}

	/**
	 *
	 * @param {string} color
	 * @returns {Observable<MerchColor[]>}
	 */
	getSizeSelection(color: MerchColor): Observable<string[]> {
		return this.getSelection$(color,
			it => it.name, it => it.color.name, it => it.size, it => it
		);
	}


	isSoldOut(event, options: number[], color: MerchColor, size: string): boolean {
		return ((this.isMerch(event) && !!size && !!color)
			|| !this.isMerch(event))
			&& options && options.length <= 1;
	}

	isMerch(event): event is Merchandise {
		return EventUtilityService.isMerchandise(event);
	}

	isTour(event): event is Tour {
		return EventUtilityService.isTour(event);
	}

	/**
	 * Fügt das aktuelle Item dem Warenkorb hinzu.
	 */
	addToCart(item: Event) {
		const options: ShoppingCartOption[] = this.isMerch(this.event)
			? new Array(this.model.amount).fill(0).map(it => ({color: this.color, size: this.size}))
			: (this.isTour(this.event)
				? new Array(this.model.amount).fill(0).map(it => ({needsTicket: true, isDriver: false}))
				: []);

		let eventType = EventUtilityService.getEventType(item);

		let itemInCart = this.shoppingCartService.getItem(eventType, item.id, options) || {options: [], amount: 0};

		this.shoppingCartService.pushItem(eventType, {
			id: item.id,
			options: [...itemInCart.options, ...options],
			item,
			amount: itemInCart.amount + this.model.amount,
		});

		this.model.amount = 0;
	}

	/**
	 *
	 * @returns {Observable<number>}
	 */
	private getEmptySeats$(): Observable<number> {
		return this._event$
			.pipe(
				mergeMap(event =>
					this.participantService
						.getParticipantIdsByEvent(event.id, Sort.none())
						.pipe(
							map(participants => event.capacity - participants.length)
						)
				),
				defaultIfEmpty(0)
			)
	}

	/**
	 *
	 * @returns {Observable<number>}
	 */
	private getStockAmount$(): Observable<number> {
		return combineLatest(
			this.stock$,
			this._color$,
			this._size$
		)
			.pipe(
				map(([stock, color, size]) => stock
				// we have to consider the selected color and size attributes
					.filter(stockItem =>
						color &&
						stockItem.color.hex === color.hex
						&& stockItem.size === size
					)
					.reduce((acc, stockItem) => acc + stockItem.amount, 0))
			)
	}

	openWaitingListDialog() {
		combineLatest(
			this.loginService.currentUser$,
			this.waitingListEntryOfUser$
		).pipe(take(1))
			.subscribe(([user, entries]) => {
				let dialogRef = this.matDialog.open(ManageWaitingListDialogComponent,
					{
						data: {
							waitingList: [...entries] as WaitingListEntry[],
							eventType: integerToType(this.event.type),
							event: this.event,
							user: user
						}
					}
				);
				dialogRef.afterClosed().subscribe(newEntries => {
					if (!newEntries) {
						return;
					}
					//id === -1 => add
					const toAdd = newEntries.filter(it => it.id === -1);
					//see if every id of oldEntries is still there in newEntries, otherwise => call delete
					const toDelete = entries.filter(it => !newEntries.find(newEntry => newEntry.id === it.id));
					//else: search if something has changed (if yes => modify)
					const toModify = entries
						.filter(it => {
							const newEntry = newEntries.find(newEntry => newEntry.id === it.id);
							if(!newEntry){
								return false;
							}
							return isEdited(it, newEntry)
						});

					const addRequests = toAdd.map(it => this.waitingListService.add(it));
					const modifyRequests = toModify.map(it => this.waitingListService.modify(it));
					const deleteRequests = toDelete.map(it => this.waitingListService.remove(it.id));

					combineLatest(
						...addRequests,
						...modifyRequests,
						...deleteRequests
					).subscribe(it => console.log(it));
				})
			});
	}

	removeFromWaitingList() {
		//todo remove all values contained in waitingListEntryOfUser
		this.waitingListEntryOfUser$.pipe(
			take(1),
			mergeMap(waitingListEntries => combineLatest(
				...waitingListEntries.map(entry => this.waitingListService.remove(entry.id))
			))
		)
			.subscribe(done => {
				this.removedFromWaitingList = true;
			})
	}
}
