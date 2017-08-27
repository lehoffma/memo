import {Injectable} from "@angular/core";
import {Party} from "../../shop/shared/model/party";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Merchandise} from "app/shop/shared/model/merchandise";
import {Tour} from "../../shop/shared/model/tour";
import {User} from "../model/user";
import {Entry} from "../model/entry";
import {asValues, BehaviorSubjectType} from "../model/util/behaviour-subject-type";
import {asObservableType, ObservableType} from "app/shared/model/util/observable-type";
import {EventUtilityService} from "../services/event-utility.service";
import {Observable} from "rxjs/Observable";
import {isNullOrUndefined} from "util";
import {EventData} from "../model/event-data";
import {ArrayObjectType} from "../model/util/array-object-type";
import {InnerArrayObjectType} from "../model/util/inner-array-object-type";
import {BaseObject} from "../model/util/base-object";
import {Address} from "../model/address";
import {Comment} from "../../shop/shared/model/comment";
import {Order} from "../model/order";
import {BankAccount} from "../model/bank-account";

export interface Cache extends EventData, ArrayObjectType<BaseObject<any>> {
	users: User[];
	entries: Entry[];
	addresses: Address[];
	comments: Comment[];
	orders: Order[];
	bankAccounts: BankAccount[];

	//todo update cache (participant + merchstoch have to be converted to immutableObject-classes)
	// participants: Participant[];
	// stocks: MerchStockList[];
}

//equivalent to InnerCacheType = User | Entry | Merchandise | Tour | Party
type InnerCacheType = InnerArrayObjectType<Cache>;

@Injectable()
export class CacheStore {
	protected cacheSize: number = 100;
	private _cache: BehaviorSubjectType<Cache> = {
		merch: new BehaviorSubject<Merchandise[]>([]),
		tours: new BehaviorSubject<Tour[]>([]),
		partys: new BehaviorSubject<Party[]>([]),
		users: new BehaviorSubject<User[]>([]),
		entries: new BehaviorSubject<Entry[]>([]),
		addresses: new BehaviorSubject<Address[]>([]),
		comments: new BehaviorSubject<Comment[]>([]),
		orders: new BehaviorSubject<Order[]>([]),
		bankAccounts: new BehaviorSubject<BankAccount[]>([])
		//todo update cache (participant + merchstoch have to be converted to immutableObject-classes)
		// participants: new BehaviorSubject<Participant[]>([]),
		// stocks: new BehaviorSubject<MerchStockList[]>([])
	};
	public cache: ObservableType<Cache> = asObservableType(this._cache);

	constructor() {
	}


	get values(): Cache {
		return asValues(this._cache);
	}

	/**
	 *
	 * @param key
	 * @param id
	 * @returns {any[]|boolean}
	 */
	isCached(key: keyof Cache, id: number): boolean {
		const value: any[] = this.values[key];

		return value && value.some(cachedObject => cachedObject.id === id);
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Merchandise | Tour | Party}
	 */
	getEventById(id: number): Merchandise | Tour | Party {
		return [
			...this.values.tours,
			...this.values.merch,
			...this.values.partys
		].find(event => event.id === id);
	}

	/**
	 *
	 * @param object
	 */
	getCacheKeyFromObject(object: InnerCacheType) {
		if (EventUtilityService.isMerchandise(object)) {
			return "merch";
		}
		if (EventUtilityService.isParty(object)) {
			return "partys";
		}
		if (EventUtilityService.isTour(object)) {
			return "tours";
		}
		if (User.isUser(object)) {
			return "users";
		}
		if (Entry.isEntry(object)) {
			return "entries";
		}
		if (Address.isAddress(object)) {
			return "addresses";
		}
		if (Comment.isComment(object)) {
			return "comments";
		}
		if (Order.isOrder(object)) {
			return "orders";
		}
		if (BankAccount.isBankAccount(object)) {
			return "bankAccounts";
		}
		return "";
	}

	/**
	 * Fügt ein objekt dem entsprechenden Cache hinzu
	 * @param object
	 */
	addOrModify(object: InnerCacheType) {
		const key: string = this.getCacheKeyFromObject(object);
		const value: InnerCacheType[] = this.values[key];
		const cachedObjectIndex = value.findIndex(innerValue => innerValue.id === object.id);

		let newValue: InnerCacheType[] = [];
		//and event isn't already part of the cache
		if (cachedObjectIndex === -1) {
			//todo throw oldest values away when size > cacheSize?
			newValue = [...value, object];

		}
		//update if it is already part of the cache
		else {
			newValue = [...value];
			newValue.splice(cachedObjectIndex, 1, object);
		}
		this._cache[key].next(newValue);
	}


	/**
	 * Fügt mehrere Objekte zu den jeweiligen Objekt-Caches hinzu, falls sie nicht bereits darin vorhanden sind
	 * @param objects
	 */
	addMultiple(...objects: InnerCacheType[]) {
		const values: any = this.values;
		const newObjects = objects.filter(objectToCache => {
			const key = this.getCacheKeyFromObject(objectToCache);
			return key !== "" && this.isCached(key, objectToCache.id);
		});

		newObjects.forEach(objectToCache => {
			const key = this.getCacheKeyFromObject(objectToCache);
			values[key].push(objectToCache)
		});

		if (newObjects.length > 0) {
			Object.keys(values)
				.forEach(type => this._cache[type].next(values[type]));
			//todo falls zu viele events gecached sind ein paar rausschmeißen?
		}
	}


	/**
	 * Löscht das Objekt mit der gegebenen eventId aus dem Cache
	 * @param key
	 * @param id
	 */
	remove(key: keyof Cache, id: number) {
		const values: Cache = this.values;
		const index = (<any[]>values[key]).findIndex(cachedObject => cachedObject.id === id);

		if (index !== -1) {
			this._cache[key].next(values[key].splice(index, 1));
		}
	}


	/**
	 * Durchsucht den cache des gegebenen Cache Typens nach dem gegebenen Suchbegriff.
	 * Falls ein Wert eines Attributes eines Objekts matcht, wird es zu den Ergebnissen hinzugefügt
	 * @param key
	 * @param searchTerm
	 */
	search(searchTerm: string, key: keyof Cache): Observable<InnerCacheType[]> {
		//todo doesnt really make sense
		//no event type specified => return all objects matching the string
		if (!key || isNullOrUndefined(key)) {
			return Observable.combineLatest(
				this.cache.tours, this.cache.partys, this.cache.merch, this.cache.users, this.cache.entries, this.cache.addresses,
				(tours, partys, merch, users, entries, addresses) => [...tours, ...partys, ...merch, ...users, ...entries, ...addresses])
				.map(objects => objects.filter((cachedObject: InnerCacheType) => cachedObject.matchesSearchTerm(searchTerm)));
		}

		return this.cache[key]
			.map(objects => objects.filter((cachedObject: InnerCacheType) => cachedObject.matchesSearchTerm(searchTerm)));
	}

}
