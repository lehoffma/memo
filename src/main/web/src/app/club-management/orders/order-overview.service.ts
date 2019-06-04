import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {combineLatest, Observable, of} from "rxjs";
import {ApiCache} from "../../shared/utility/cache/api-cache";
import {Event} from "../../shop/shared/model/event";
import {map, switchMap, tap} from "rxjs/operators";
import {EventService} from "../../shared/services/api/event.service";

@Injectable({
	providedIn: "root"
})
export class OrderOverviewService {
	private _cache: ApiCache<any> = new ApiCache();
	loadDate = new Date();

	constructor(private http: HttpClient,
				private eventService: EventService) {
	}

	openOrders(): Observable<{ open: number; openChange: number }> {
		const url = "/api/orders/open-orders";
		const params = new HttpParams();
		const request = this.http.get<{ openOrders: { open: number; openChange: number } }>(url).pipe(
			map(it => it.openOrders)
		);
		return this._cache.search(params, request, url);
	}

	totalOrders(): Observable<{ total: number; totalChange: number }> {
		const url = "/api/orders/total-orders";
		const params = new HttpParams();
		const request = this.http.get<{ totalOrders: { total: number; totalChange: number } }>(url).pipe(
			map(it => it.totalOrders)
		);
		return this._cache.search(params, request, url);
	}

	ordersOverTime(): Observable<{ timestamp: string, amount: number }[]> {
		const url = "/api/orders/orders-over-time";
		const params = new HttpParams();
		const request = this.http.get<{ orders: { timestamp: string, amount: number }[] }>(url).pipe(
			map(it => it.orders)
		);
		return this._cache.search(params, request, url);
	}

	popularItems(): Observable<PopularItem[]> {
		const url = "/api/orders/popular-items";
		const params = new HttpParams();
		const request = this.http.get<{ popularItems: PopularItemId[] }>(url).pipe(
			map(it => it.popularItems),
			switchMap(items => {
				if (items.length === 0) {
					return of([]);
				}

				return combineLatest(
					items.map(item => this.eventService.getById(item.id).pipe(
						map(event => ({
							item: event,
							amount: item.amount
						}))
					))
				)
			}),
			tap(it => console.log(it)),
		);
		return this._cache.search(params, request, url);
	}

	popularColors(): Observable<PopularColor[]> {
		const url = "/api/orders/popular-colors";
		const params = new HttpParams();
		const request = this.http.get<{ popularColors: PopularColor[] }>(url).pipe(
			map(it => it.popularColors)
		);
		return this._cache.search(params, request, url);
	}

	popularSizes(): Observable<PopularSize[]> {
		const url = "/api/orders/popular-sizes";
		const params = new HttpParams();
		const request = this.http.get<{ popularSizes: PopularSize[] }>(url).pipe(
			map(it => it.popularSizes)
		);
		return this._cache.search(params, request, url);
	}
}

export interface PopularItemId {
	id: number;
	amount: number;
}

export interface PopularItem {
	item: Event;
	amount: number;
}

export interface PopularColor {
	name: string;
	hex: string;
	amount: number;
}

export interface PopularSize {
	size: string;
	amount: number;
}
