import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ApiCache} from "../../shared/utility/cache/api-cache";
import {Event} from "../../shop/shared/model/event";

@Injectable({
	providedIn: "root"
})
export class OrderOverviewService {
	private _cache: ApiCache<any> = new ApiCache();
	loadDate = new Date();

	constructor(private http: HttpClient) {
	}

	openOrders(): Observable<{ open: number; change: number }> {
		const params = new HttpParams();
		const request = this.http.get<{ open: number; change: number }>("/api/orders/open-orders");
		return this._cache.search(params, request);
	}

	totalOrders(): Observable<{ total: number; change: number }> {
		const params = new HttpParams();
		const request = this.http.get<{ total: number; change: number }>("/api/orders/total-orders");
		return this._cache.search(params, request);
	}

	ordersOverTime(): Observable<{ timestamp: string, amount: number }[]> {
		const params = new HttpParams();
		const request = this.http.get<{ timestamp: string, amount: number }[]>("/api/orders/orders-over-time");
		return this._cache.search(params, request);
	}

	popularItems(): Observable<PopularItem[]> {
		const params = new HttpParams();
		const request = this.http.get<PopularItem[]>("/api/orders/popular-items");
		return this._cache.search(params, request);
	}

	popularColors(): Observable<PopularColor[]> {
		const params = new HttpParams();
		const request = this.http.get<PopularColor[]>("/api/orders/popular-colors");
		return this._cache.search(params, request);
	}

	popularSizes(): Observable<PopularSize[]> {
		const params = new HttpParams();
		const request = this.http.get<PopularSize[]>("/api/orders/popular-sizes");
		return this._cache.search(params, request);
	}
}

export interface PopularItem extends Event {
	amount: number;
}

export interface PopularColor {
	name: string;
	hex: string;
	amount: number;
}

export interface PopularSize {
	size: string;
	amount: string;
}
