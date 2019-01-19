import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {WaitingListEntry} from "../../../shop/shared/model/waiting-list";
import {Observable} from "rxjs";
import {Filter} from "../../model/api/filter";
import {Sort} from "../../model/api/sort";
import {mergeMap, tap} from "rxjs/operators";
import {Params} from "@angular/router";
import {PageRequest} from "../../model/api/page-request";
import {Page} from "../../model/api/page";

@Injectable()
export class WaitingListService extends ServletService<WaitingListEntry> {

	constructor(protected http: HttpClient) {
		super(http, "/api/event/waiting-list");
	}


	getAllByEventId(eventId: number): Observable<WaitingListEntry[]>;
	getAllByEventId(eventId: number, sort: Sort): Observable<WaitingListEntry[]>;
	getAllByEventId(eventId: number, sort: Sort = Sort.none(), filter: Filter = Filter.none()): Observable<WaitingListEntry[]> {
		return this.getAll(
			Filter.combine(filter, Filter.by({"eventId": "" + eventId})),
			sort
		);
	}

	getByEventId(eventId: number, page: PageRequest, sort: Sort = Sort.none(), filter: Filter = Filter.none()): Observable<Page<WaitingListEntry>> {
		return this.get(
			Filter.combine(filter, Filter.by({"eventId": "" + eventId})),
			page,
			sort
		);
	}

	addOrModify(requestMethod: AddOrModifyRequest, entry: WaitingListEntry, options?: any): Observable<WaitingListEntry> {
		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {"waiting-list": entry}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		}))
			.pipe(
				tap(() => this.invalidateValue(entry.id)),
				tap(() => this.invalidateValue(entry.shopItem, false, "search")),
				mergeMap(json => this.getById(json.id)),
			);
	}


	remove(id: number, additionalParams?: Params, ...args): Observable<Object> {
		return this.getById(id).pipe(
			mergeMap(waitingListEntry => {
				return super.remove(id, additionalParams, args).pipe(
					tap(() => this.invalidateValue(waitingListEntry.shopItem, false, "search")),
				)
			})
		);
	}
}
