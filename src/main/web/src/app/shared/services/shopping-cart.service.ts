import {Injectable, OnInit} from "@angular/core";
import {EventType} from "../../shop/shared/model/event-type";
import {ShoppingCartContent} from "../model/shopping-cart-content";
import {ShoppingCartItem, ShoppingCartOption} from "../model/shopping-cart-item";
import {MerchColor} from "../../shop/shared/model/merch-color";
import {EventService} from "./api/event.service";
import {map, mergeMap} from "rxjs/operators";
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {LogInService} from "./api/login.service";
import {DiscountService} from "app/shop/shared/services/discount.service";
import {StorageService} from "./storage.service";

@Injectable()
export class ShoppingCartService implements OnInit {
	private _content: BehaviorSubject<ShoppingCartContent> = new BehaviorSubject({
		merch: [],
		partys: [],
		tours: []
	});
	public content: Observable<ShoppingCartContent>        = this._content.asObservable();
	/**
	 * Der Key, der für das Speichern des ShoppingCartContents im LocalStorage verwendet wird
	 * @type {string}
	 */
			private readonly localStorageKey               = "shoppingCart";

	constructor(private eventService: EventService,
				private loginService: LogInService,
				private storage: StorageService,
				private discountService: DiscountService
	) {
		this.initFromLocalStorage();
	}

	get amountOfCartItems(): Observable<number> {
		return this.content
			.pipe(
				map(content => [...content.merch, ...content.partys, ...content.tours]
					.reduce((previousValue, currentValue) => previousValue + currentValue.amount, 0))
			);
	}

	get total$(): Observable<number> {
		return this.content
			.pipe(
				mergeMap(items => {
					const allItems = [...items.tours, ...items.partys, ...items.merch];
					if (allItems.length === 0) {
						return of([]);
					}

					return (combineLatest(
						...allItems
							.map(cartItem => this.loginService.currentUser$
								.pipe(
									mergeMap(user => this.discountService.calculateDiscountedPriceOfEvent(
										cartItem.item.id, cartItem.item.price, user !== null ? user.id : null
									)),
									map(discountedPrice => (cartItem.amount - 1) * cartItem.item.price + discountedPrice)
								)
							)));
				}),
				map(prices => prices.reduce((acc, current) => acc + current, 0))
			)
			;
	}

	ngOnInit() {
	}

	/**
	 * Resets the cart content
	 */
	reset() {
		this._content.next({tours: [], partys: [], merch: []});
		this.storage.local().ifPresent(storage => storage.removeItem(this.localStorageKey));
	}

	isPartOfShoppingCart(id: number) {
		return this.content.pipe(
			map(content => !!([...content.merch, ...content.tours, ...content.partys]
				.find(value => value.id === id))
			)
		);
	}

	/**
	 *
	 * @param {T} valueA
	 * @param {T} valueB
	 * @param {keyof T} key
	 * @returns {boolean}
	 */
	doesntExistOrIsEqual<T>(valueA: T, valueB: T, key: keyof T): boolean {
		return (!valueA && !valueB) ||
			(valueA[key] === undefined && valueB[key] === undefined) || (valueA[key] === valueB[key]);
	}

	/**
	 * Testet, ob die übergebenen items equal sind
	 * @param itemA
	 * @param itemB
	 * @returns {boolean|{size?: string, color?: MerchColor}}
	 */
	itemsAreEqual(itemA: ShoppingCartItem, itemB: ShoppingCartItem) {
		const optionIsEqual = (optionA: ShoppingCartOption, optionB: ShoppingCartOption): boolean => {
			return this.doesntExistOrIsEqual(optionA, optionB, "size") &&
				this.doesntExistOrIsEqual(optionA.color, optionB.color, "hex") &&
				this.doesntExistOrIsEqual(optionA.color, optionB.color, "name");
		};

		const optionsAreEqual = itemA.options
			.every(option => !!itemB.options
				.find(it => optionIsEqual(option, it))
			);

		return itemA.id === itemB.id &&
			((!itemA.options && !itemB.options) || optionsAreEqual ||
				(itemA.options && itemA.options.length === 0) || (itemB.options && itemB.options.length === 0));
	}

	/**
	 *
	 * @param type die Art des Events (entweder 'merch', 'tours' oder 'partys')
	 * @param item das Item welches hinzugefügt werden soll
	 */
	public pushItem(type: EventType, item: ShoppingCartItem) {
		let newValue = this.push(type, item, this._content.value);
		this.pushNewValue(newValue);
	}

	/**
	 *
	 * @param type die Art des Events (entweder 'merch', 'tours' oder 'partys')
	 * @param id die ID des Items, welches gelöscht werden soll
	 * @param options
	 */
	public deleteItem(type: EventType, id: number, options?: ShoppingCartOption[]) {
		let newValue = this.remove(this._content.value, type, id, options);
		this.pushNewValue(newValue);
	}

	/**
	 * Holt das Item mit den übergebenen werten aus dem shopping cart
	 * Gibt null zurück, wenn das Objekt nicht im Warenkorb vorhanden ist
	 * @param type
	 * @param id
	 * @param item
	 * @param options
	 */
	public getItem(type: EventType, id: number, options?: ShoppingCartOption[]) {
		return this.findItem(this._content.getValue()[type], id, options);
	}

	/**
	 * Returned ein Observable, welches das objekt mit der gegebenen ID + den gegebenen options beinhaltet.
	 * Falls dieses nicht vorhanden sein sollte, beinhaltet das Observable null.
	 * @param type
	 * @param id
	 * @param item
	 * @param options
	 * @returns {Observable<R>}
	 */
	public getItemAsObservable(type: EventType, id: number, options?: ShoppingCartOption[]) {
		return this._content
			.pipe(
				map(content => this.findItem(content[type], id, options))
			);
	}

	/**
	 *
	 * @param {ShoppingCartItem[]} items
	 * @param {number} id
	 * @param item
	 * @param options
	 * @returns {ShoppingCartItem | undefined}
	 */
	private findItem(items: ShoppingCartItem[], id: number, options?: ShoppingCartOption[]) {
		return items.find((shoppingCartItem: ShoppingCartItem) =>
			this.itemsAreEqual(shoppingCartItem, {id, item: null, options, amount: 0})
		);
	}

	/**
	 *
	 * @param type die Art des Events (entweder 'merch', 'tours' oder 'partys')
	 * @param id die ID des Items, welches entfernt werden soll
	 * @param content das content-objekt, aus dem das Item entfernt werden soll
	 * @param options
	 * @returns {ShoppingCartContent}
	 */
	private remove(content: ShoppingCartContent, type: EventType,
				   id: number, options?: ShoppingCartOption[]) {
		let itemIndex = content[type].findIndex(cartItem => this.itemsAreEqual(cartItem, {
			id,
			item: null,
			options,
			amount: 0
		}));
		if (itemIndex >= 0) {
			//remove
			content[type].splice(itemIndex, 1);
		}

		//das objekt gibt es nicht :(
		return content;
	}

	/**
	 *
	 * @param type die Art des Events (entweder 'merch', 'tours' oder 'partys')
	 * @param item das Item, welches hinzugefügt werden soll
	 * @param content das content-objekt, zu dem das Item hinzugefügt werden soll
	 * @returns {ShoppingCartContent}
	 */
	private push(type: EventType, item: ShoppingCartItem, content: ShoppingCartContent) {
		//Vergleicht ob das Objekt den gleichen inhalt hat.
		let itemIndex = content[type].findIndex(cartItem => this.itemsAreEqual(cartItem, item));
		//Wenn ja, wird die Anzahl angepasst
		if (itemIndex !== -1) {
			if (item.amount === 0) {
				content[type].splice(itemIndex, 1);
			}
			else {
				// content[type][itemIndex].amount = item.amount;
				content[type][itemIndex] = {...item};
			}
		}
		//wenn nein, wird das item hinzugefügt
		else {
			content[type].push(item);
		}
		return content;
	}

	/**
	 * Pusht die gegebenen Daten in das interne Content Object, so dass alle Subscriber
	 * Methoden mit den neuen Daten aufgerufen werden
	 * @param newValue
	 */
	private pushNewValue(newValue: ShoppingCartContent) {
		this._content.next(newValue);
		this.saveToLocalStorage(this._content.value);
	}

	/**
	 * Initialisiert das _content Objekt mit den im LocalStorage gespeicherten Daten
	 */
	private initFromLocalStorage() {
		this.pushNewValue(this.getContentFromLocalStorage());
	}

	/**
	 * Speichert das gegebene ShoppingCartContent objekt im LocalStorage
	 * @param content
	 */
	private saveToLocalStorage(content: ShoppingCartContent) {
		this.storage.local().ifPresent(storage => storage.setItem(this.localStorageKey, JSON.stringify(content)));
	}

	/**
	 * Holt die gespeicherten ShoppingCartContent Daten aus dem LocalStorage des Browsers.
	 * TODO: update if content is too old (example: tour has already happened)
	 * @returns {any}
	 */
	private getContentFromLocalStorage(): ShoppingCartContent {
		const json: string = this.storage.local()
			.map(storage => storage.getItem(this.localStorageKey))
			.orElse(undefined);

		//falls nichts im localStorage gespeichert wurde, ist der Warenkorb wohl leer
		if (!json) {
			return {partys: [], tours: [], merch: []};
		}

		return JSON.parse(json);
	}
}
