import {Injectable} from "@angular/core";
import {ApiCache} from "../../shared/utility/cache/api-cache";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export interface StockState {
	ok: number;
	soldOut: number;
	warning: number
}

@Injectable({
	providedIn: "root"
})
export class StockOverviewService {
	private _cache: ApiCache<any> = new ApiCache();
	loadDate = new Date();

	constructor(private http: HttpClient) {
	}


	state(): Observable<StockState> {
		const url = "/api/stock/state";
		const params = new HttpParams();
		const request = this.http.get<{ state: StockState }>(url).pipe(
			map(it => it.state)
		);
		return this._cache.search(params, request, url);
	}
}
