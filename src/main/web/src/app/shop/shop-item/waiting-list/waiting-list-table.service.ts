import {Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../../../shared/utility/material-table/util/expandable-table-container.service";
import {WaitingListUser} from "../../shared/model/waiting-list";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {LogInService} from "../../../shared/services/api/login.service";
import {Observable} from "rxjs";
import {map, mergeMap} from "rxjs/operators";
import {EventType} from "../../shared/model/event-type";
import {EventInfo} from "../item-details/participants/participant-list/participant-list.service";
import {EventService} from "../../../shared/services/api/event.service";
import {WaitingListDataSource} from "./waiting-list-data-source";

@Injectable()
export class WaitingListTableService extends ExpandableTableContainerService<WaitingListUser> {
	dataSource: WaitingListDataSource;

	eventInfo$: Observable<EventInfo> = this.activatedRoute.url
		.pipe(
			map((urls: UrlSegment[]) => {
				// "tours/:id/waiting-list"
				// "partys/:id/waiting-list"
				// "merch/:id/waiting-list"
				let eventType = EventType[urls[0].path];
				let eventId = +urls[1].path;

				return {eventType, eventId};
			})
		);

	eventTitle = this.eventInfo$
		.pipe(
			mergeMap(eventInfo => this.eventService.getById(eventInfo.eventId)),
			map(event => event.title)
		);

	constructor(private loginService: LogInService,
				private eventService: EventService,
				private activatedRoute: ActivatedRoute) {
		super(
			loginService.getActionPermissions("party", "tour")
		)
	}

	add(): void {
		console.log("add");
	}

	edit(entry: WaitingListUser): void {
		console.log("edit", entry);
	}

	remove(entries: WaitingListUser[]): void {
		console.log("remove", entries);
	}
}
