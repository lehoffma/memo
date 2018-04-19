import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {QueryParameterService} from "../../../shared/services/query-parameter.service";
import {Event} from "../../../shop/shared/model/event";
import {EventService} from "../../../shared/services/api/event.service";
import {EventType} from "../../../shop/shared/model/event-type";
import {FormControl} from "@angular/forms";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {EntryCategoryService} from "../../../shared/services/api/entry-category.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {filter, first, map, share, startWith, tap} from "rxjs/operators";
import {EntryCategory} from "../../../shared/model/entry-category";
import {combineLatest} from "rxjs/observable/combineLatest";
import {isAfter, isBefore, isValid, parse} from "date-fns"


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
		.pipe(share());

	events: Event[] = [];

	availableEvents$ = new BehaviorSubject<Event[]>([]);
	dateOptions: { from: Date, to: Date } = {
		from: undefined,
		to: undefined
	};
	autocompleteFormControl: FormControl = new FormControl();
	filteredOptions: Observable<Event[]>;
	subscription: Subscription;

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

	get availableEvents() {
		return this.availableEvents$.value;
	}

	set availableEvents(events: Event[]) {
		this.availableEvents$.next(events);
	}

	async ngOnInit() {
		const categories: EntryCategory[] = await this.costCategories$
			.pipe(first())
			.toPromise();
		categories.forEach(category => this.costTypes[category.name] = true);
		// await this.getAvailableEvents();
		this.readQueryParams();
		this.initEventAutoComplete();
	}


	ngOnDestroy(): void {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}

	/**
	 *
	 */
	initEventAutoComplete() {
		this.autocompleteFormControl.valueChanges
			.pipe(
				filter(value => EventUtilityService.isEvent(value)),
			)
			.subscribe(value => {
				this.events.push(value);
				this.autocompleteFormControl.reset();
				this.updateQueryParams();
			});


		this.filteredOptions = this.autocompleteFormControl.valueChanges
			.pipe(
				startWith(""),
				map(event => event && EventUtilityService.isEvent(event) ? event.title : event),
				map(title => {
					const availableEvents = this.availableEvents
						.filter(event => !this.events.find(selectedEvent => selectedEvent.id === event.id));
					return title
						? this.filter(availableEvents, title)
						: availableEvents.slice()
				})
			);
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
	 */
	async getAvailableEvents() {
		await combineLatest(
			this.eventService.search("", EventType.tours),
			this.eventService.search("", EventType.partys),
			this.eventService.search("", EventType.merch)
		)
			.pipe(
				first(),
				tap(([tours, partys, merch]) => {
					this.availableEvents = [...tours, ...partys, ...merch]
						.filter(event => {
							let from = !this.dateOptions.from ? parse("1970-01-01") : this.dateOptions.from;
							let to = !this.dateOptions.to ? parse("2100-01-01") : this.dateOptions.to;

							return isAfter(event.date, from) && isBefore(event.date, to);
						});
					this.autocompleteFormControl.setValue("", {emitEvent: true});
				})
			)
			.toPromise()
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
				this.dateOptions.from = queryParamMap.has("from") ? parse(queryParamMap.get("from")) : undefined;
				this.dateOptions.to = queryParamMap.has("to") ? parse(queryParamMap.get("to")) : undefined;
				await this.getAvailableEvents();
				if (queryParamMap.has("eventTypes")) {
					this.readBinaryValuesFromQueryParams(this.eventTypes, queryParamMap.getAll("eventTypes"));
				}
				if (queryParamMap.has("costTypes")) {
					this.readBinaryValuesFromQueryParams(this.costTypes, queryParamMap.getAll("costTypes"));
				}
				//in case the route is something like /tours/:eventId/costs, extract the event id
				if (paramMap.has("eventId")) {
					this.events = this.availableEvents.findIndex(event => event.id === +paramMap.get("eventId")) !== -1
						? [this.availableEvents.find(event => event.id === +paramMap.get("eventId"))]
						: [];
				}
				if (queryParamMap.has("eventIds")) {
					this.events = queryParamMap.getAll("eventIds")
						.map(eventId => this.availableEvents.find(event => event.id === +eventId))
						.filter(event => event !== null)
				}
				this.updateQueryParams();
			})
	}


	/**
	 * Updates the query parameters based on the values chosen by the user
	 */
	updateQueryParams() {
		const params: Params = {};

		params["eventTypes"] = Object.keys(this.eventTypes)
			.filter(key => this.eventTypes[key]);
		params["costTypes"] = Object.keys(this.costTypes)
			.filter(key => this.costTypes[key]);

		params["eventIds"] = this.events.map(event => event.id);

		params["from"] = (!this.dateOptions.from || !isValid(this.dateOptions.from)) ? "" : this.dateOptions.from.toISOString();
		params["to"] = (!this.dateOptions.to || !isValid(this.dateOptions.to)) ? "" : this.dateOptions.to.toISOString();

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
