import {Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../../../../../../shared/utility/material-table/util/expandable-table-container.service";
import {WaitingListUser} from "../../../../../shared/model/waiting-list";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {LogInService} from "../../../../../../shared/services/api/login.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {EventType} from "../../../../../shared/model/event-type";
import {EventInfo} from "../participant-list.service";
import {EventService} from "../../../../../../shared/services/api/event.service";
import {WaitingListDataSource} from "./waiting-list-data-source";
import {ParticipantListOption} from "../participants-category-selection/participants-category-selection.component";

@Injectable()
export class WaitingListTableService extends ExpandableTableContainerService<WaitingListUser> {
	dataSource: WaitingListDataSource;

	eventInfo$: Observable<EventInfo> = this.activatedRoute.url
		.pipe(
			map((urls: UrlSegment[]) => {
				// "/shop/tours/:id/waiting-list"
				// "/shop/partys/:id/waiting-list"
				// "/shop/merch/:id/waiting-list"
				let eventType = EventType[urls[1].path];
				let eventId = +urls[2].path;

				return {eventType, eventId};
			})
		);


	view$: Observable<ParticipantListOption> = this.activatedRoute.queryParamMap
		.pipe(
			map((queryParamMap) => {
				if (!queryParamMap.has("view")) {
					return "participated";
				}

				const view = queryParamMap.get("view");
				if (!(["participated", "isDriver", "needsTicket"].includes(view))) {
					return ["participated"];
				}

				return view as any;
			})
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
