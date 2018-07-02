import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {HttpClient, HttpParams} from "@angular/common/http";
import {CachedService} from "./cached.service";

export interface EventCapacity {
	eventId: number;
	capacity: number;
}

@Injectable()
export class CapacityService extends CachedService<EventCapacity> {
	private baseUrl = "/api/capacity";

	constructor(private http: HttpClient) {
		super();
	}

	getById(eventId: number): Observable<EventCapacity> {
		const params = new HttpParams().set("id", "" + eventId);
		const request = this.http.get<{ capacity: EventCapacity[] }>(this.baseUrl, {params})
			.pipe(map(it => it.capacity[0]));

		return this._cache.getById(params, request);
	}
}
