import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AddOrModifyRequest, ServletService} from "./servlet.service";
import {WaitingListEntry} from "../../../shop/shared/model/waiting-list";
import {Observable} from "rxjs";
import {Filter} from "../../model/api/filter";
import {Sort} from "../../model/api/sort";

@Injectable()
export class WaitingListService extends ServletService<WaitingListEntry> {

	constructor(protected http: HttpClient) {
		super(http, "/api/event/waiting-list");
	}


	getByEventId(eventId: number): Observable<WaitingListEntry[]>;
	getByEventId(eventId: number, sort: Sort): Observable<WaitingListEntry[]>;
	getByEventId(eventId: number, sort: Sort = Sort.none(), filter: Filter = Filter.none()): Observable<WaitingListEntry[]> {
		return this.getAll(
			Filter.combine(filter, Filter.by({"id": "" + eventId})),
			sort
		);
	}

	addOrModify(requestMethod: AddOrModifyRequest, entry: WaitingListEntry, options?: any): Observable<WaitingListEntry> {
		return undefined;
	}

	remove(id: number, ...args: (any)[]): Observable<Object> {
		return undefined;
	}
}
