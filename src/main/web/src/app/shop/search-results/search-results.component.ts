import {ChangeDetectionStrategy, Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EventService} from "../../shared/services/api/event.service";
import {Event} from "../shared/model/event";
import {eventSortingOptions} from "../../shared/search/sorting-options";
import {SearchFilterService} from "../../shared/search/search-filter.service";
import {FilterOptionBuilder} from "../../shared/search/filter-option-builder.service";
import {SearchResultsFilterOption} from "../../shared/search/search-results-filter-option";
import {BehaviorSubject, Observable} from "rxjs";
import {defaultIfEmpty, filter, map} from "rxjs/operators";
import {Filter} from "../../shared/model/api/filter";
import {NOW} from "../../util/util";
import {MatDialog} from "@angular/material/dialog";
import {LogInService} from "../../shared/services/api/login.service";
import {Permission, visitorPermissions} from "../../shared/model/permission";
import {isNullOrUndefined} from "util";
import {userPermissions} from "../../shared/model/user";
import {CreateEventContextMenuComponent} from "../../club/event-calendar-container/create-event-context-menu/create-event-context-menu.component";
import {FilterOptionFactoryService} from "../../shared/search/filter-option-factory.service";
import {FilterOption} from "../../shared/search/filter-options/filter-option";
import {NavigationService} from "../../shared/services/navigation.service";
import {BaseSearchResultsComponent} from "../../shared/search/base-search-results.component";

@Component({
	selector: "memo-search-results",
	templateUrl: "./search-results.component.html",
	styleUrls: ["./search-results.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultComponent extends BaseSearchResultsComponent<Event> {

	userCanAddItem$: Observable<boolean> = this.loginService.getActionPermissions("merch", "tour", "party")
		.pipe(
			map(permission => permission.Hinzufuegen)
		);


	constructor(protected activatedRoute: ActivatedRoute,
				protected searchFilterService: SearchFilterService,
				protected matDialog: MatDialog,
				protected filterOptionBuilder: FilterOptionBuilder,
				protected filterOptionFactory: FilterOptionFactoryService,
				protected navigationService: NavigationService,
				protected loginService: LogInService,
				protected eventService: EventService,
				protected router: Router) {
		super(
			new BehaviorSubject<FilterOption[]>([
				filterOptionFactory.category,
				filterOptionFactory.price,
			]),
			eventSortingOptions,
			loginService.getActionPermissions("merch", "tour", "party")
				.pipe(
					map(permission => permission.Hinzufuegen)
				),
			{
				date: (key, value) => {
					let newKey = key;
					let newValue: string;
					if (value === "past") {
						newKey = "maxDate";
					} else if (value === "upcoming") {
						newKey = "minDate";
					}
					newValue = NOW.toISOString();
					return {key: newKey, value: newValue};
				}
			},
			activatedRoute,
			searchFilterService,
			navigationService,
			loginService,
			eventService,
			router
		)
	}


	ngOnInit() {
	}


	openCreateDialog() {
		const permissions$ = this.loginService.currentUser$
			.pipe(
				filter(user => user !== null),
				map(user => userPermissions(user)),
				filter(permissions => !isNullOrUndefined(permissions)),
				defaultIfEmpty(visitorPermissions)
			);

		const dialogRef = this.matDialog.open(CreateEventContextMenuComponent, {
			autoFocus: false,
			data: {
				date: new Date(),
				tours: permissions$
					.pipe(map(permissions => permissions.tour >= Permission.create)),
				partys: permissions$
					.pipe(map(permissions => permissions.party >= Permission.create)),
				merch: permissions$
					.pipe(map(permissions => permissions.merch >= Permission.create)),
				show: {tours: true, partys: true, merch: true}
			}
		});

		dialogRef.afterClosed()
			.subscribe(console.log, console.error)
	}

	protected buildFilterOptions(filter: Filter): Observable<FilterOption[]> {
		return this.filterOptionBuilder
			.empty()
			.withOptions(
				SearchResultsFilterOption.EVENT_CATEGORY,
				SearchResultsFilterOption.DATE,
				SearchResultsFilterOption.PRICE,
				SearchResultsFilterOption.COLOR,
				SearchResultsFilterOption.MATERIAL,
				SearchResultsFilterOption.SIZE
			)
			.build(filter);
	}

}
