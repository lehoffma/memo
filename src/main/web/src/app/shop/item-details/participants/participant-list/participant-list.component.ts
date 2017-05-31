import {Component, HostListener, OnInit, Type} from "@angular/core";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {ParticipantUser} from "../../../shared/model/participant";
import {Observable} from "rxjs/Observable";
import {EventType} from "../../../shared/model/event-type";
import {ParticipantsService} from "../../../../shared/services/participants.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ExpandableTableColumn} from "../../../../shared/expandable-table/expandable-table-column";
import {BooleanCheckMarkCellComponent} from "../../../../club-management/administration/member-list/member-list-table-cells/boolean-checkmark-cell.component";
import {ColumnSortingEvent} from "../../../../shared/expandable-table/column-sorting-event";
import {attributeSortingFunction, sortingFunction} from "../../../../util/util";
import {FullNameTableCellComponent} from "app/shop/item-details/participants/participant-list/full-name-table-cell.component";
import {SingleValueListExpandedRowComponent} from "../../../../shared/expandable-table/single-value-list-expanded-row/single-value-list-expanded-row.component";
import {ExpandedRowComponent} from "../../../../shared/expandable-table/expanded-row.component";
import {MdDialog} from "@angular/material";
import {
	ModifyParticipantComponent,
	ModifyParticipantEvent
} from "app/shop/item-details/participants/participant-list/modify-participant/modify-participant.component";
import {EventService} from "../../../../shared/services/event.service";

const participantListColumns = {
	name: new ExpandableTableColumn<ParticipantUser>("Name", "user", FullNameTableCellComponent),
	isDriver: new ExpandableTableColumn<ParticipantUser>("Fahrer", "isDriver", BooleanCheckMarkCellComponent),
	hasPaid: new ExpandableTableColumn<ParticipantUser>("Bezahlt", "hasPaid", BooleanCheckMarkCellComponent),
	comments: new ExpandableTableColumn<ParticipantUser>("Kommentare", "comments")
};

@Component({
	selector: "memo-participant-list",
	templateUrl: "./participant-list.component.html",
	styleUrls: ["./participant-list.component.scss"]
})
export class ParticipantListComponent implements OnInit {
	eventInfo: Observable<{
		eventType: EventType,
		eventId: number
	}> = this.activatedRoute.url.map((urls: UrlSegment[]) => {
		// "tours/:id/participants"
		// "partys/:id/participants"
		let eventType = EventType[urls[0].path];
		let eventId = +urls[1].path;

		return {eventType, eventId};
	});

	eventTitle = this.eventInfo
		.flatMap(eventInfo => this.eventService.getById(eventInfo.eventId, {eventType: eventInfo.eventType}))
		.map(event => event.title);

	private _columnKeys: BehaviorSubject<ExpandableTableColumn<ParticipantUser>[]> = new BehaviorSubject([
		participantListColumns.name, participantListColumns.isDriver,
		participantListColumns.hasPaid, participantListColumns.comments
	]);

	columnKeys = this._columnKeys.asObservable();

	private _expandedKeys: BehaviorSubject<ExpandableTableColumn<ParticipantUser>[]> = new BehaviorSubject([]);

	expandedKeys = this._expandedKeys.asObservable();
	expandedRowComponent: Type<ExpandedRowComponent<any>> = SingleValueListExpandedRowComponent;

	isExpandable = this.expandedKeys.map(keys => keys.length > 0);

	private _sortBy: BehaviorSubject<ColumnSortingEvent<ParticipantUser>> =
		new BehaviorSubject<ColumnSortingEvent<ParticipantUser>>({
			key: "user",
			descending: true
		});

	sortBy = this._sortBy.asObservable();

	participants: Observable<ParticipantUser[]> =
		Observable.combineLatest(this.sortBy, this.activatedRoute.url
			.flatMap((urls: UrlSegment[]) => {
				// "tours/:id/participants"
				// "partys/:id/participants"
				let eventType = EventType[urls[0].path];
				let eventId = +urls[1].path;

				return this.participantService.getParticipantUsersByEvent(eventId, eventType);
			}))
			.map(([sortBy, participants]) => {
				if (sortBy) {
					if (sortBy.key === "user") {
						return [...participants
							.sort(sortingFunction<ParticipantUser>(participant =>
								participant.user.surname, sortBy.descending))];
					}
					return [...participants
						.sort(attributeSortingFunction(sortBy.key, sortBy.descending))];
				}
				return [...participants];
			});


	/**
	 * Updated die column keys abhängig von der übergebenen screen width.
	 * Je höher die Breite des Bildschirms, desto mehr keys werden in den main rows angezeigt
	 * @param screenWidth
	 */
	updateColumnKeys(screenWidth: number) {
		let newColumns: ExpandableTableColumn<ParticipantUser>[] = [
			participantListColumns.name, participantListColumns.hasPaid
		];
		if (screenWidth > 500) {
			newColumns.push(participantListColumns.isDriver);
		}
		if (screenWidth > 700) {
			newColumns.push(participantListColumns.comments);
		}
		this._columnKeys.next(newColumns);
		this._expandedKeys.next(Object.keys(participantListColumns)
			.filter(key => !newColumns.includes(participantListColumns[key]))
			.map(key => participantListColumns[key]))
	}

	@HostListener("window:resize", ["$event"])
	onResize(event) {
		this.updateColumnKeys(event.target.innerWidth);
	}


	constructor(private activatedRoute: ActivatedRoute,
				private dialog: MdDialog,
				private eventService: EventService,
				private participantService: ParticipantsService) {
	}

	ngOnInit() {
		this.updateColumnKeys(window.innerWidth);
	}

	updateSortBy(event: ColumnSortingEvent<ParticipantUser>) {
		this._sortBy.next(event);
	}

	/**
	 *
	 */
	addParticipant() {
		this.eventInfo.first()
			.subscribe(eventInfo => {
				this.dialog.open(ModifyParticipantComponent, {data: {associatedEventInfo: eventInfo}})
					.afterClosed()
					.subscribe((result: ModifyParticipantEvent) => {
						if (result) {
							this.participantService.addParticipant(eventInfo.eventId, eventInfo.eventType, result.participant)
							//todo do something other than logging the result
								.subscribe(response => console.log(response));
						}
					})
			})
	}

	/**
	 *
	 * @param event
	 */
	editParticipant(event) {
		this.eventInfo.first()
			.subscribe(eventInfo => {
				this.dialog.open(ModifyParticipantComponent, {data: {participant: event, associatedEventInfo: eventInfo}})
					.afterClosed()
					.subscribe((result: ModifyParticipantEvent) => {
						if (result) {
							this.participantService.updateParticipant(eventInfo.eventId, eventInfo.eventType, result.participant)
							//todo do something other than logging the result
								.subscribe(response => console.log(response));
						}
					})
			})
	}

	/**
	 *
	 * @param event
	 */
	deleteParticipant(event: ParticipantUser[]) {
		this.eventInfo.first()
			.subscribe(eventInfo => {
				event.forEach(participantUser => {
					this.participantService.deleteParticipant(eventInfo.eventId, eventInfo.eventType, participantUser.id)
						.subscribe(result => console.log(result));
				});
			})
	}
}
