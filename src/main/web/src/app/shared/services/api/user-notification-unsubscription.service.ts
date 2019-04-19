import {Injectable} from "@angular/core";
import {UserNotificationUnsubscription} from "../../model/user-notification";
import {Observable} from "rxjs";
import {ApiCache} from "../../utility/cache/api-cache";
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable({
	providedIn: "root"
})
export class UserNotificationUnsubscriptionService {
	private baseUrl = "/api/notificationsUnsubscriptions";
	private _cache: ApiCache<UserNotificationUnsubscription> = new ApiCache();

	constructor(private http: HttpClient) {
	}

	getByUserId(id: number | string): Observable<UserNotificationUnsubscription[]> {
		const params = new HttpParams().set("userId", "" + id);
		const request = this.http.get<UserNotificationUnsubscription[]>(this.baseUrl, {params});
		return this._cache.other(params, request);
	}
}
