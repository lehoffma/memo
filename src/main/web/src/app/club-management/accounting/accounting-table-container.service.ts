import {Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../../shared/utility/material-table/util/expandable-table-container.service";
import {Entry} from "../../shared/model/entry";
import {LogInService} from "../../shared/services/api/login.service";
import {ParamMap, Router} from "@angular/router";
import {EntryService} from "../../shared/services/api/entry.service";
import {isNullOrUndefined} from "util";
import {EventService} from "../../shared/services/api/event.service";
import {NavigationService} from "../../shared/services/navigation.service";
import {BehaviorSubject, combineLatest, Observable, of, Subject} from "rxjs";
import {debounceTime, distinctUntilChanged, first, map, mergeMap, takeUntil, tap} from "rxjs/operators";
import {ItemImagePopupComponent} from "../../shop/shop-item/item-details/container/image-popup/item-image-popup.component";
import {MatDialog} from "@angular/material/dialog";
import {ManualPagedDataSource} from "../../shared/utility/material-table/manual-paged-data-source";
import {PageRequest} from "../../shared/model/api/page-request";
import {Direction, Sort} from "../../shared/model/api/sort";
import {getAllQueryValues} from "../../shared/model/util/url-util";
import {Filter} from "../../shared/model/api/filter";


@Injectable()
export class AccountingTableContainerService extends ExpandableTableContainerService<Entry> {
	sortedBy$: Observable<Sort> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => paramMap.has("sortBy") && paramMap.has("direction")
				? Sort.by(paramMap.get("direction"), getAllQueryValues(paramMap, "sortBy").join(","))
				: Sort.by(Direction.DESCENDING, "date")),
			distinctUntilChanged((a, b) => Sort.equal(a, b))
		);

	filteredBy$: Observable<Filter> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => {
				let paramObject = {};
				paramMap.keys
					.filter(key => !["page", "pageSize", "sortBy", "direction"].includes(key))
					.forEach(key => {
						let value = getAllQueryValues(paramMap, key).join(",");
						paramObject[key] = value;
					});
				return Filter.by(paramObject);
			}),
			distinctUntilChanged((a, b) => Filter.equal(a, b))
		);

	page$ = new BehaviorSubject(PageRequest.at(
		(+this.navigationService.queryParamMap$.getValue().get("page") || 1) - 1,
		(+this.navigationService.queryParamMap$.getValue().get("pageSize") || 20)
	));
	public dataSource: ManualPagedDataSource<Entry> = new ManualPagedDataSource<Entry>(this.entryService, this.page$);
	loading$ = this.dataSource.isLoading$;

	entries$: Observable<Entry[]> = this.dataSource.connect();

	loading = false;

	private resetPage = new Subject();

	constructor(protected loginService: LogInService,
				protected router: Router,
				protected navigationService: NavigationService,
				protected eventService: EventService,
				protected matDialog: MatDialog,
				protected entryService: EntryService) {
		super(loginService.getActionPermissions("funds"));

		this.dataSource.filter$ = this.filteredBy$;
		this.dataSource.sort$ = this.sortedBy$;

		this.dataSource.initPaginatorFromUrlAndUpdatePage(this.navigationService.queryParamMap$.getValue());
		this.dataSource.writePaginatorUpdatesToUrl(this.router);

		this.dataSource.updateOn(
			combineLatest(
				this.filteredBy$,
				this.sortedBy$
			).pipe(
				debounceTime(100),
				tap(() => this.resetPage.next()),
			)
		);

		this.resetPage.pipe(takeUntil(this.onDestroy$))
			.subscribe(it => this.pageAt(0));

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

	pageAt(page: number) {
		const currentValue = this.page$.getValue();
		this.page$.next(PageRequest.at(page, currentValue.pageSize));
		this.dataSource.update();
	}

	ngOnDestroy() {
		super.ngOnDestroy();
		this.onDestroy$.next(true);
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
				this.router.navigate(["shop", "create", "entries"], {queryParams});
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
