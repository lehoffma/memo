import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {QueryParameterService} from "../../../shared/services/query-parameter.service";
import {Event} from "../../../shop/shared/model/event";
import {EventService} from "../../../shared/services/api/event.service";
import {EventType} from "../../../shop/shared/model/event-type";
import {FormControl} from "@angular/forms";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {EntryCategoryService} from "../../../shared/services/api/entry-category.service";
import {BehaviorSubject, combineLatest, Observable, Subscription} from "rxjs";
import {first, map, share} from "rxjs/operators";
import {EntryCategory} from "../../../shared/model/entry-category";
import {isValid, parse, setYear} from "date-fns"
import {Filter} from "../../../shared/model/api/filter";


@Component({
	selector: "memo-accounting-options",
	templateUrl: "./accounting-options.component.html",
	styleUrls: ["./accounting-options.component.scss"]
})
export class AccountingOptionsComponent implements OnInit, OnDestroy {
	@Input() hidden: boolean = false;

	eventTypes = {
		tours: true,
		events: true,
		merch: true
	};

	costTypes = {};

	costCategories$ = this.entryCategoryService.getCategories()
		.pipe(share(), map(it => it.content));

	events: Event[] = [];

	dateOptions: { from: Date, to: Date } = {
		from: undefined,
		to: undefined
	};
	autocompleteFormControl: FormControl = new FormControl();
	filteredOptions: Observable<Event[]>;
	subscription: Subscription;

	filters$: BehaviorSubject<Filter> = new BehaviorSubject(Filter.none());

	constructor(private queryParameterService: QueryParameterService,
				private router: Router,
				private changeDetectorRef: ChangeDetectorRef,
				private entryCategoryService: EntryCategoryService,
				private eventService: EventService,
				private activatedRoute: ActivatedRoute) {
	}

	_isLoading = false;

	get isLoading() {
		return this._isLoading;
	}

	set isLoading(value: boolean) {
		this._isLoading = value;
		if (value) {
			this.autocompleteFormControl.disable();
		}
		else {
			this.autocompleteFormControl.enable();
		}
	}


	async ngOnInit() {
		const categories: EntryCategory[] = await this.costCategories$
			.pipe(first())
			.toPromise();
		categories.forEach(category => this.costTypes[category.name] = true);
		// await this.getAvailableEvents();
		this.readQueryParams();
	}


	ngOnDestroy(): void {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}

	updateDateFilter() {
		this.filters$.next(Filter.by({
			"minDate": (this.dateOptions.from && this.dateOptions.from.toISOString()) || setYear(new Date(), 1970).toISOString(),
			"maxDate": (this.dateOptions.to && this.dateOptions.to.toISOString()) || setYear(new Date(), 3000).toISOString()
		}))
	}

	addEvent(event: Event) {
		this.events.push(event);
		this.autocompleteFormControl.reset();
		this.updateQueryParams();
	}


	/**
	 * Defines how the event will be presented in the autocomplete box
	 * @returns {any}
	 * @param event
	 */
	displayFn(event: Event): string {
		if (event) {
			return event.title;
		}
		return "";
	}

	/**
	 *
	 * @param {Event} event
	 * @returns {EventType}
	 */
	getEventType(event: Event): EventType {
		return EventUtilityService.getEventType(event);
	}


	/**
	 * Filters the options array by checking the events title
	 * @param options
	 * @param name
	 * @returns {any[]}
	 */
	filter(options: Event[], name: string): Event[] {
		return options.filter(option => {
			const regex = new RegExp(`${name}`, "gi");
			return regex.test(option.title);
		});
	}

	/**
	 *
	 * @param object
	 * @param keys
	 */
	readBinaryValuesFromQueryParams(object: {
		[key: string]: boolean
	}, keys: string[]) {
		Object.keys(object)
			.filter(key => keys.indexOf(key) === -1)
			.forEach(key => object[key] = false);
		keys.forEach(key => object[key] = true);
	}

	/**
	 * Updates the values by extracting them from the url query parameters
	 */
	readQueryParams() {
		this.subscription = combineLatest(
			this.activatedRoute.paramMap,
			this.activatedRoute.queryParamMap
		)
			.subscribe(async ([paramMap, queryParamMap]) => {
				this.isLoading = true;
				this.changeDetectorRef.detectChanges();
				this.dateOptions.from = queryParamMap.has("minDate") ? parse(queryParamMap.get("minDate")) : undefined;
				this.dateOptions.to = queryParamMap.has("maxDate") ? parse(queryParamMap.get("maxDate")) : undefined;
				if (queryParamMap.has("eventType")) {
					this.readBinaryValuesFromQueryParams(this.eventTypes, queryParamMap.getAll("eventType"));
				}
				if (queryParamMap.has("entryType")) {
					this.readBinaryValuesFromQueryParams(this.costTypes, queryParamMap.getAll("entryType"));
				}
				//in case the route is something like /tours/:eventId/costs, extract the event id
				if (paramMap.has("eventId")) {
					this.eventService.getById(+paramMap.get("eventId")).subscribe(event => this.events = [event]);
				}
				if (queryParamMap.has("eventId")) {
					combineLatest(
						...queryParamMap.getAll("eventId")
							.map(it => this.eventService.getById(+it))
					)
						.subscribe(events => this.events = events);
				}
				this.updateQueryParams();
			})
	}


	/**
	 * Updates the query parameters based on the values chosen by the user
	 */
	updateQueryParams() {
		const params: Params = {};

		params["eventType"] = Object.keys(this.eventTypes)
			.filter(key => this.eventTypes[key]);
		params["entryType"] = Object.keys(this.costTypes)
			.filter(key => this.costTypes[key]);

		params["eventId"] = this.events.map(event => event.id);

		params["minDate"] = (!this.dateOptions.from || !isValid(this.dateOptions.from)) ? "" : this.dateOptions.from.toISOString();
		params["maxDate"] = (!this.dateOptions.to || !isValid(this.dateOptions.to)) ? "" : this.dateOptions.to.toISOString();

		this.activatedRoute.queryParamMap
			.pipe(
				first(),
				map(queryParamMap =>
					this.queryParameterService.updateQueryParams(queryParamMap, params))
			)
			.subscribe(async newQueryParams => {
				await this.router.navigate(["management", "costs"], {queryParams: newQueryParams, replaceUrl: true});
			}, null, () => this.isLoading = false);
	}
}
