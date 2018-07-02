import {Injectable, OnDestroy} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OrderedItem} from "../../model/ordered-item";
import {map, mergeMap} from "rxjs/operators";
import {EventUtilityService} from "../../services/event-utility.service";
import {EventType} from "../../../shop/shared/model/event-type";
import {BehaviorSubject, Observable, of} from "rxjs";
import {MerchColor} from "../../../shop/shared/model/merch-color";
import {MerchStock, MerchStockList} from "../../../shop/shared/model/merch-stock";
import {StockService} from "../../services/api/stock.service";

@Injectable()
export class OrderedItemInputFormService implements OnDestroy {

	public addOrderedItemForm: FormGroup = this.formBuilder.group({
		"id": [-1],
		"item": [undefined, {
			validators: [Validators.required]
		}],
		"price": [undefined, {
			validators: [Validators.required, Validators.pattern(/^[\d]+((\.|\,)[\d]{1,2})?$/)]
		}],
		"status": [undefined, {
			validators: [Validators.required]
		}],
		"size": [undefined],
		"color": [undefined],
		"isDriver": [undefined],
		"needsTicket": [undefined]
	});

	type$: BehaviorSubject<EventType> = new BehaviorSubject<EventType>(undefined);

	isMerch$ = this.type$
		.pipe(
			map(type => type === EventType.merch)
		);

	isTour$ = this.type$
		.pipe(
			map(type => type === EventType.tours)
		);

	stock$: Observable<MerchStockList> = this.isMerch$
		.pipe(
			mergeMap(isMerch => {
				if (!isMerch) {
					return of([]);
				}
				return this.stockService.getByEventId(this.addOrderedItemForm.get("item").value.id);
			}),
			map(stockList => stockList.filter(it => it.amount > 0))
		);
	_size$: BehaviorSubject<string> = new BehaviorSubject(undefined);
	_color$: BehaviorSubject<MerchColor> = new BehaviorSubject(undefined);
	colorSelection$: Observable<MerchColor[]> = this.getColorSelection("");
	sizeSelection$: Observable<string[]> = this._color$
		.pipe(
			mergeMap(color => this.getSizeSelection(color))
		);

	subscriptions = [];

	constructor(private formBuilder: FormBuilder,
				private stockService: StockService) {
		this.subscriptions = [
			this.addOrderedItemForm.valueChanges
				.pipe(
					map(value => (value === null || value.item === null) ? null : EventUtilityService.getEventType(value.item))
				)
				.subscribe(type => this.type$.next(type)),
			this.isMerch$.subscribe(isMerch => {
				if (isMerch) {
					this.addOrderedItemForm.get("size").setValidators([Validators.required]);
					this.addOrderedItemForm.get("color").setValidators([Validators.required]);
				}
				else {
					this.addOrderedItemForm.get("size").clearValidators();
					this.addOrderedItemForm.get("color").clearValidators();
				}
			})
		]
	}


	/**
	 *
	 * @param {OrderedItem} orderedItem
	 */
	setOrderedItem(orderedItem: OrderedItem) {
		this.addOrderedItemForm.setValue({
			id: orderedItem.id,
			item: orderedItem.item,
			price: orderedItem.price,
			status: orderedItem.status,
			size: orderedItem.size,
			color: orderedItem.color,
			isDriver: orderedItem.isDriver,
			needsTicket: orderedItem.needsTicket
		}, {emitEvent: true});

		this.type$.next(EventUtilityService.getEventType(orderedItem.item));
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
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
							.findIndex(it => selectionValueId(_value) === selectionValueId(it)) === index)
				})
			);
	}
}
