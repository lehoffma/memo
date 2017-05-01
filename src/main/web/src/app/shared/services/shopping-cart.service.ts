import {Injectable, OnInit} from "@angular/core";
import {EventType} from "../../shop/shared/model/event-type";
import {BehaviorSubject, Observable} from "rxjs";
import {ShoppingCartContent} from "../model/shopping-cart-content";
import {ShoppingCartItem} from "../model/shopping-cart-item";

@Injectable()
export class ShoppingCartService implements OnInit {
	private _content: BehaviorSubject<ShoppingCartContent> = new BehaviorSubject({
		merch: [],
		partys: [],
		tours: []
	});
	public content = this._content.asObservable();


	constructor() {
		this.initFromLocalStorage();
	}

	ngOnInit() {
	}

	get amountOfCartItems(): Observable<number> {
		return this.content.map(content => [...content.merch, ...content.partys, ...content.tours]
			.reduce((previousValue, currentValue) => previousValue + currentValue.amount, 0))
	}

	/**
	 *
	 * @param type die Art des Events (entweder 'merch', 'tours' oder 'partys')
	 * @param id die ID des Items, welches entfernt werden soll
	 * @param content das content-objekt, aus dem das Item entfernt werden soll
	 * @returns {ShoppingCartContent}
	 */
	private remove(type: EventType, id: number, content: ShoppingCartContent) {
		let itemIndex = content[type].findIndex(cardItem => cardItem.id === id);
		if (itemIndex) {
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
	private add(type: EventType, item: ShoppingCartItem, content: ShoppingCartContent) {
		//Vergleicht ob das Objekt den gleichen inhalt hat.
		let itemIndex = content[type].findIndex(cardItem => {
			return cardItem.id === item.id
				&& cardItem.options
				&& cardItem.options.size === item.options.size
				&& cardItem.options.color === item.options.color
		});
		//Wenn ja, wird die Anzahl erhöht..
		if (itemIndex !== -1) {
			content[type][itemIndex].amount += item.amount;
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
	public addItem(type: EventType, item: ShoppingCartItem) {
		let newValue = this.add(type, item, this._content.value);
		this.pushNewValue(newValue);
	}

	/**
	 *
	 * @param type die Art des Events (entweder 'merch', 'tours' oder 'partys')
	 * @param id die ID des Items, welches gelöscht werden soll
	 */
	public deleteItem(type: EventType, id: number) {
		let newValue = this.remove(type, id, this._content.value);
		this.pushNewValue(newValue);
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
