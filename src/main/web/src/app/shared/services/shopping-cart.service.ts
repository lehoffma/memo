import {Injectable, OnInit} from "@angular/core";
import {EventType} from "../../shop/shared/model/event-type";
import {BehaviorSubject, Observable} from "rxjs";
import {ShoppingCartContent} from "../model/shopping-cart-content";
import {ShoppingCartItem} from "../model/shopping-cart-item";
import {MerchColor} from "../../shop/shared/model/merch-color";
import {EventService} from "./event.service";

@Injectable()
export class ShoppingCartService implements OnInit {
	private _content: BehaviorSubject<ShoppingCartContent> = new BehaviorSubject({
		merch: [],
		partys: [],
		tours: []
	});
	public content:Observable<ShoppingCartContent> = this._content.asObservable();


	constructor(private eventService: EventService,) {
		this.initFromLocalStorage();
	}

	ngOnInit() {
	}

	get amountOfCartItems(): Observable<number> {
		return this.content.map(content => [...content.merch, ...content.partys, ...content.tours]
			.reduce((previousValue, currentValue) => previousValue + currentValue.amount, 0))
	}

	get total(): Observable<number> {
		return this.content
			.flatMap(content =>
				Observable.combineLatest(
					...[...content.merch, ...content.partys, ...content.tours]
						.map(item => this.eventService.getById(item.id)
							.map(event => event.price * item.amount)))
			)
			.map(prices => prices.reduce((acc, price) => acc + price, 0));
	}

	/**
	 * Resets the cart content
	 */
	reset(){
		this._content.next({tours: [], partys: [], merch:[]});
	}

	/**
	 * Testet, ob die übergebenen items equal sind
	 * @param itemA
	 * @param itemB
	 * @returns {boolean|{size?: string, color?: MerchColor}}
	 */
	itemsAreEqual(itemA: ShoppingCartItem, itemB: ShoppingCartItem) {
		return itemA.id === itemB.id && (
			(!itemA.options.size && !itemA.options.color && !itemB.options.size && !itemB.options.color) ||
			(itemA.options.size === itemB.options.size
				&& itemA.options.color.name === itemB.options.color.name
				&& itemA.options.color.hex === itemB.options.color.hex))
	}

	/**
	 *
	 * @param type die Art des Events (entweder 'merch', 'tours' oder 'partys')
	 * @param id die ID des Items, welches entfernt werden soll
	 * @param content das content-objekt, aus dem das Item entfernt werden soll
	 * @param options
	 * @returns {ShoppingCartContent}
	 */
	private remove(content: ShoppingCartContent, type: EventType, id: number, options?: { size?: string, color?: MerchColor }) {
		let itemIndex = content[type].findIndex(cartItem => this.itemsAreEqual(cartItem, {id, options, amount: 0}));
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
				content[type][itemIndex].amount = item.amount;
			}
		}
		//wenn nein, wird das item hinzugefügt
		else {
			content[type].push(item);
		}
		return content;
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
	public deleteItem(type: EventType, id: number, options?: { size?: string, color?: MerchColor }) {
		let newValue = this.remove(this._content.value, type, id, options);
		this.pushNewValue(newValue);
	}

	/**
	 * Holt das Item mit den übergebenen werten aus dem shopping cart
	 * Gibt null zurück, wenn das Objekt nicht im Warenkorb vorhanden ist
	 * @param type
	 * @param id
	 * @param options
	 */
	public getItem(type: EventType, id: number, options?: { size?: string, color?: MerchColor }) {
		return this._content.getValue()[type].find((shoppingCartItem: ShoppingCartItem) =>
			this.itemsAreEqual(shoppingCartItem, {id, options, amount: 0})
		)
	}

	/**
	 * Returned ein Observable, welches das objekt mit der gegebenen ID + den gegebenen options beinhaltet.
	 * Falls dieses nicht vorhanden sein sollte, beinhaltet das Observable null.
	 * @param type
	 * @param id
	 * @param options
	 * @returns {Observable<R>}
	 */
	public getItemAsObservable(type: EventType, id: number, options?: { size?: string, color?: MerchColor }) {
		return this._content.map(content => content[type].find((shoppingCartItem: ShoppingCartItem) =>
			this.itemsAreEqual(shoppingCartItem, {id, options, amount: 0}))
		);
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
	 * Der Key, der für das Speichern des ShoppingCartContents im LocalStorage verwendet wird
	 * @type {string}
	 */
	private readonly localStorageKey = "shoppingCart";

	/**
	 * Speichert das gegebene ShoppingCartContent objekt im LocalStorage
	 * @param content
	 */
	private saveToLocalStorage(content: ShoppingCartContent) {
		localStorage.setItem(this.localStorageKey, JSON.stringify(content));
	}

	/**
	 * Holt die gespeicherten ShoppingCartContent Daten aus dem LocalStorage des Browsers.
	 * TODO: speichern, wann es das letzte mal gespeichert wurde und löschen, falls zu lange her (1 tag?)
	 * @returns {any}
	 */
	private getContentFromLocalStorage(): ShoppingCartContent {
		const json: string = localStorage.getItem(this.localStorageKey);

		//falls nichts im localStorage gespeichert wurde, ist der Warenkorb wohl leer
		if (!json) {
			return {partys: [], tours: [], merch: []};
		}

		return JSON.parse(json);
	}
}
