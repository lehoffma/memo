import {Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../../shared/utility/material-table/util/expandable-table-container.service";
import {Entry} from "../../shared/model/entry";
import {LogInService} from "../../shared/services/api/login.service";
import {ParamMap, Router} from "@angular/router";
import {EntryService} from "../../shared/services/api/entry.service";
import {isNullOrUndefined} from "util";
import {EventService} from "../../shared/services/api/event.service";
import {NavigationService} from "../../shared/services/navigation.service";
import {Observable, of} from "rxjs";
import {first, map, mergeMap} from "rxjs/operators";
import {RowAction} from "../../shared/utility/material-table/util/row-action";
import {RowActionType} from "../../shared/utility/material-table/util/row-action-type";
import {ItemImagePopupComponent} from "../../shop/shop-item/item-details/container/image-popup/item-image-popup.component";
import {MatDialog} from "@angular/material";
import {PagedDataSource} from "../../shared/utility/material-table/paged-data-source";


@Injectable()
export class AccountingTableContainerService extends ExpandableTableContainerService<Entry> {

	dataSource: PagedDataSource<Entry>;

	rowActions: RowAction<Entry>[] = [
		{
			icon: "collections",
			predicate: entry => entry.images.length > 0,
			name: "Bilder"
		},
		{
			icon: "edit",
			name: RowActionType.EDIT
		},
		{
			icon: "delete",
			name: RowActionType.DELETE
		},
	];

	subscriptions = [];

	loading = false;

	constructor(protected loginService: LogInService,
				protected router: Router,
				protected navigationService: NavigationService,
				protected eventService: EventService,
				protected matDialog: MatDialog,
				protected entryService: EntryService) {
		super(loginService.getActionPermissions("funds"));

		this.actionHandlers["Bilder"] = entries => {
			const images = entries[0].images;
			const selectedImage = images[0];
			this.matDialog.open(ItemImagePopupComponent, {
				data: {
					images: images,
					imagePath: selectedImage
				}
			})
		};
	}

	ngOnDestroy() {
		super.ngOnDestroy();
		this.subscriptions.forEach(it => it.unsubscribe());
	}


	/**
	 * Extracts the first eventId from the given query parameters map and returns a new queryParam Object
	 * containing the eventId and an ISO-formatted date string (if the map contained just one id,
	 * otherwise the object is empty).
	 * @param {ParamMap} queryParamMap
	 * @returns {Observable<{}>}
	 */
	getQueryParamsForEntryModification(queryParamMap: ParamMap) {
		//extract eventIds from the query parameters, if they are any
		const eventIds = queryParamMap.has("eventId") ? queryParamMap.get("eventId").split(",") : [];
		const queryParams = {};
		if (eventIds.length === 1) {
			queryParams["eventId"] = eventIds[0];
			return this.eventService.getById(+eventIds[0])
				.pipe(
					map(event => {
						queryParams["date"] = event.date.toISOString();
						return queryParams;
					})
				)
		}
		return of(queryParams);
	}

	/**
	 * Redirects the user to the "create entry" page. If the user was looking at an event's costs, the query params
	 * will be set so that the created entry will automatically be associated with the event.
	 */
	add() {
		this.navigationService.queryParamMap$
			.pipe(
				first(),
				mergeMap(this.getQueryParamsForEntryModification.bind(this))
			)
			.subscribe(queryParams => {
				this.router.navigate(["create", "entries"], {queryParams});
			});
	}

	/**
	 * Redirects the user to the "modify entry" page. If the user was looking at an event's costs, the query params
	 * will be set so that the created entry will automatically be associated with the event.
	 * @param entryObj
	 */
	edit(entryObj: Entry) {
		this.navigationService.queryParamMap$
			.pipe(
				first(),
				mergeMap(this.getQueryParamsForEntryModification.bind(this))
			)
			.subscribe(queryParams => {
				if (!isNullOrUndefined(entryObj.id) && entryObj.id >= 0) {
					this.router.navigate(["entries", entryObj.id, "edit"], {queryParams});
				}
			});

	}

	/**
	 * Calls the remove Http request of the entryService and, if successful, removes the entry from the internal subject too.
	 * @param entries
	 */
	remove(entries: Entry[]) {
		entries.forEach(merchObject => this.entryService.remove(merchObject.id)
			.subscribe(() => this.dataSource.reload()));
	}

}
