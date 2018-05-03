import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {Event} from "../../../../shared/model/event";
import {Merchandise} from "../../../../shared/model/merchandise";
import {ShoppingCartService} from "../../../../../shared/services/shopping-cart.service";
import {EventUtilityService} from "../../../../../shared/services/event-utility.service";
import {EventOverviewKey} from "./event-overview-key";
import {StockService} from "../../../../../shared/services/api/stock.service";
import {MerchColor} from "../../../../shared/model/merch-color";
import {MerchStock, MerchStockList} from "../../../../shared/model/merch-stock";
import {ShopItem} from "../../../../../shared/model/shop-item";
import {TypeOfProperty} from "../../../../../shared/model/util/type-of-property";
import {OrderedItemService} from "../../../../../shared/services/api/ordered-item.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {defaultIfEmpty, filter, map, mergeMap, take, tap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {LogInService} from "../../../../../shared/services/api/login.service";
import {User} from "../../../../../shared/model/user";
import {Discount} from "../../../../../shared/renderers/price-renderer/discount";
import {DiscountService} from "../../../../shared/services/discount.service";
import {Tour} from "../../../../shared/model/tour";
import {MatDialog, MatSnackBar} from "@angular/material";
import {ShareDialogComponent} from "../../../../../shared/share-dialog/share-dialog.component";
import {ResponsibilityService} from "../../../../shared/services/responsibility.service";
import {ShoppingCartOption} from "../../../../../shared/model/shopping-cart-item";
import {isBefore} from "date-fns";
import {ObservableCache} from "../../../../../shared/cache/observable-cache";
import {canCheckIn, canConclude, canDeleteEntries, canEdit, canReadEntries} from "app/util/permissions-util";
import {EventService} from "../../../../../shared/services/api/event.service";
import {ConfirmationDialogService} from "../../../../../shared/services/confirmation-dialog.service";
import {Router} from "@angular/router";
import {CapacityService} from "../../../../../shared/services/api/capacity.service";
import {Subscription} from "rxjs/Subscription";
import {of} from "rxjs/observable/of";
import {NavigationService} from "../../../../../shared/services/navigation.service";


@Component({
	selector: "memo-item-details-overview",
	templateUrl: "./item-details-overview.component.html",
	styleUrls: ["./item-details-overview.component.scss"]
})
export class ItemDetailsOverviewComponent implements OnInit, OnDestroy {
	//todo refactor into tinier components/services
	_event$: BehaviorSubject<Event> = new BehaviorSubject(Event.create());

	stock$: Observable<MerchStockList> = this._event$
		.pipe(
			filter(event => EventUtilityService.isMerchandise(event)),
			filter(event => event.id !== -1),
			mergeMap(event => this.stockService.getByEventId(event.id))
		);

	public colorSelection$: Observable<MerchColor[]> = this.getColorSelection("");

	@Input() overviewKeys: EventOverviewKey[] = [];
	_color$: BehaviorSubject<MerchColor> = new BehaviorSubject(undefined);
	public sizeSelection$: Observable<string[]> = this._color$
		.pipe(
			mergeMap(color => this.getSizeSelection(color))
		);
	_size$: BehaviorSubject<string> = new BehaviorSubject(undefined);
	model = {
		amount: undefined
	};

	public maxAmount$: Observable<number> = this._event$
		.pipe(
			filter(event => event !== undefined && event.id >= 0),
			mergeMap(event => this.isMerch(event)
				? this.getStockAmount$()
				: (<Observable<number>>this.getValue("capacity"))
			)
		);
	public amountOptions$: Observable<number[]> = of([]);
	public isPartOfShoppingCart$ = this._event$
		.pipe(
			mergeMap(event => this.shoppingCartService.isPartOfShoppingCart(event.id))
		);
	public isPastEvent$: Observable<boolean> = this._event$
		.pipe(
			map(event => (event && event.id !== -1 && isBefore(event.date, new Date())))
		);
	private _cache: ObservableCache<number> = new ObservableCache<number>()
		.withAsyncFallback("capacity", () => this._event$
			.pipe(
				filter(event => event.id >= 0),
				mergeMap(event => this.capacityService.valueChanges(event.id)),
				filter(it => it !== null),
				map(it => it.capacity)
			)
		)
		.withAsyncFallback("emptySeats", () => this.getEmptySeats$());


	permissions$: Observable<{
		checkIn: boolean;
		edit: boolean;
		conclude: boolean;
		entries: boolean;
		delete: boolean;
	}> = combineLatest(
		this.loginService.currentUser$,
		this._event$
	)
		.pipe(
			map(([currentUser, event]) => ({
				checkIn: canCheckIn(currentUser, event),
				edit: canEdit(currentUser, event),
				conclude: canConclude(currentUser, event),
				entries: canReadEntries(currentUser, event),
				delete: canDeleteEntries(currentUser, event)
			}))
		);


	discounts$: Observable<Discount[]> =
		combineLatest(
			this._event$,
			this.loginService.accountObservable
				.pipe(defaultIfEmpty(-1))
		)
			.pipe(
				mergeMap(([event, userId]) => this.discountService.getEventDiscounts(event.id, userId)),
				defaultIfEmpty([]),
			);


	responsible$: Observable<User[]> = this._event$
		.pipe(mergeMap(event => this.responsibilityService.getResponsible(event.id)));


	maxAmountSubscription: Subscription;

	constructor(private participantService: OrderedItemService,
				private discountService: DiscountService,
				private stockService: StockService,
				private loginService: LogInService,
				private navigationService: NavigationService,
				private shoppingCartService: ShoppingCartService,
				private eventService: EventService,
				private snackBar: MatSnackBar,
				private capacityService: CapacityService,
				private router: Router,
				private confirmationDialogService: ConfirmationDialogService,
				private responsibilityService: ResponsibilityService,
				private matDialog: MatDialog) {
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
		if (this.maxAmountSubscription) {
			this.maxAmountSubscription.unsubscribe();
		}
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
	 * @returns {Observable<number>}
	 */
	private getStockAmount$(): Observable<number> {
		return combineLatest(
			this.stock$,
			this._color$,
			this._size$
		)
			.pipe(
				tap(it => console.log(it)),
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

	/**
	 *
	 * @returns {Observable<number>}
	 */
	private getEmptySeats$(): Observable<number> {
		return this._event$
			.pipe(
				mergeMap(event =>
					this.participantService
						.getParticipantIdsByEvent(event.id, EventUtilityService.getEventType(event))
						.pipe(
							map(participants => event.capacity - participants.length)
						)
				),
				defaultIfEmpty(0)
			)
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

	/**
	 * Deletes the current item, after showing a confirmation dialog
	 */
	deleteItem() {
		this.confirmationDialogService.openDialog("Möchtest du dieses Item wirklich löschen?")
			.subscribe(yes => {
				if (yes) {
					this.eventService.remove(this.event.id)
						.subscribe(
							success => {
								this.snackBar.open("Das Item wurde erfolgreich gelöscht", null, {
									duration: 5000
								});
								this.router.navigateByUrl("/");
							},
							error => {
								console.error(error);
								this.snackBar.open("Das Item konnte nicht gelöscht werden.", null, {
									duration: 5000
								});
							}
						)
				}
			})
	}

	/**
	 * Updates maxAmount and amountOptions (i.e. the amount-dropdown)
	 */
	updateMaxAmount() {
		if (this.maxAmountSubscription) {
			this.maxAmountSubscription.unsubscribe();
		}

		this.amountOptions$ = this.maxAmount$
			.pipe(
				//fills the amountOptions variable with integers from 0 to maxAmount
				map(maxAmount => Array((maxAmount === undefined) ? 0 : maxAmount + 1).fill(0).map((_, i) => i))
			);

		this.maxAmountSubscription = this.maxAmount$
			.subscribe(maxAmount => {
				console.log(maxAmount);

				const options = new Array(this.model.amount).fill({color: this.color, size: this.size});
				const shoppingCartItem = this.shoppingCartService.getItem(EventUtilityService.getEventType(this.event),
					this.event.id, options);

				if (shoppingCartItem) {
					this.model.amount = shoppingCartItem.amount;
				}
				else {
					this.model.amount = 0;
				}
			});

	}

	isSoldOut(event, options: number[]): boolean {
		return ((this.isMerch(event) && !!this.size && !!this.color)
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
	 *
	 */
	updateShoppingCart() {
		const options: ShoppingCartOption[] = this.isMerch(this.event)
			? new Array(this.model.amount).fill(0).map(it => ({color: this.color, size: this.size}))
			: (this.isTour(this.event)
				? new Array(this.model.amount).fill(0).map(it => ({needsTicket: true, isDriver: false}))
				: []);
		const eventType = EventUtilityService.getEventType(this.event);
		const newItem = {
			id: this.event.id,
			item: this.event,
			amount: this.model.amount,
			options: options,
		};

		this.isPartOfShoppingCart$
			.pipe(take(1))
			.subscribe(isPartOfShoppingCart => {
				if (isPartOfShoppingCart) {
					this.shoppingCartService.pushItem(eventType, newItem);
				}
			});
	}

	/**
	 * Fügt das aktuelle Item dem Warenkorb hinzu.
	 */
	addOrDeleteFromCart(item: Event) {
		const options: ShoppingCartOption[] = this.isMerch(this.event)
			? new Array(this.model.amount).fill(0).map(it => ({color: this.color, size: this.size}))
			: (this.isTour(this.event)
				? new Array(this.model.amount).fill(0).map(it => ({needsTicket: true, isDriver: false}))
				: []);

		this.isPartOfShoppingCart$
			.pipe(take(1))
			.subscribe(isPartOfShoppingCart => {
				this.shoppingCartService.pushItem(EventUtilityService.getEventType(item), {
					id: item.id,
					options,
					item,
					amount: !isPartOfShoppingCart ? this.model.amount : 0,
				});
			});
	}

	openShareDialog() {
		this.matDialog.open(ShareDialogComponent, {
			data: {
				title: this.event.title,
				url: "http://meilenwoelfe.org/" + this.navigationService.getUrlOfItem(this.event),
				description: this.event.description,
				image: this.event.images[0],
				additionalTags: []
			}
		})
	}

}
