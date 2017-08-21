import {Component, Input, OnInit} from "@angular/core";
import * as moment from "moment";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {QueryParameterService} from "../../../shared/services/query-parameter.service";
import {Event} from "../../../shop/shared/model/event";
import {EventService} from "../../../shared/services/event.service";
import {EventType} from "../../../shop/shared/model/event-type";
import {Observable} from "rxjs/Observable";
import {FormControl} from "@angular/forms";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {EntryCategoryService} from "../../../shared/services/entry-category.service";

@Component({
	selector: "memo-accounting-options",
	templateUrl: "./accounting-options.component.html",
	styleUrls: ["./accounting-options.component.scss"]
})
export class AccountingOptionsComponent implements OnInit {
	@Input() hidden: boolean = false;
	eventTypes = {
		tours: true,
		events: true,
		merch: true
	};

	costTypes = {};

	costCategories$ = this.entryCategoryService.getCategories();

	events: Event[] = [];

	availableEvents$ = new BehaviorSubject<Event[]>([]);

	get availableEvents() {
		return this.availableEvents$.value;
	}

	set availableEvents(events: Event[]) {
		this.availableEvents$.next(events);
	}

	dateOptions = {
		from: undefined,
		to: undefined
	};


	autocompleteFormControl: FormControl = new FormControl();
	filteredOptions: Observable<Event[]>;

	constructor(private queryParameterService: QueryParameterService,
				private router: Router,
				private entryCategoryService: EntryCategoryService,
				private eventService: EventService,
				private activatedRoute: ActivatedRoute) {
	}

	async ngOnInit() {
		this.costCategories$.first().subscribe(categories => {
			categories.forEach(category => this.costTypes[category.name] = true);
			this.updateQueryParams();
		});
		await this.getAvailableEvents();
		this.readQueryParams();
		this.initEventAutoComplete();
	}

	/**
	 *
	 */
	initEventAutoComplete() {
		this.autocompleteFormControl.valueChanges
			.subscribe(value => {
				if (EventUtilityService.isTour(value) || EventUtilityService.isParty(value) || EventUtilityService.isMerchandise(value)) {
					this.events.push(value);
					this.autocompleteFormControl.reset();
					this.updateQueryParams();
				}
			});


		this.filteredOptions = this.autocompleteFormControl.valueChanges
			.startWith("")
			.map(event => event && typeof event === "object" ? event.title : event)
			.map(title => {
				let availableEvents = this.availableEvents
					.filter(event => !this.events.find(selectedEvent => selectedEvent.id === event.id));
				return title
					? this.filter(availableEvents, title)
					: availableEvents.slice()
			})
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
		await Observable.combineLatest(
			this.eventService.search("", EventType.tours),
			this.eventService.search("", EventType.partys),
			this.eventService.search("", EventType.merch)
		)
			.first()
			.toPromise()
			.then(([tours, partys, merch]) => {
				this.availableEvents = [...tours, ...partys, ...merch]
					.filter(event => {
						let from = !this.dateOptions.from ? moment("1970-01-01") : this.dateOptions.from;
						let to = !this.dateOptions.to ? moment("2100-01-01") : this.dateOptions.to;

						return moment(event.date)
							.isBetween(moment(from), moment(to));
					});
				this.autocompleteFormControl.setValue("", {emitEvent: true});
			})

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
		Observable.combineLatest(
			this.activatedRoute.paramMap,
			this.activatedRoute.queryParamMap
		)
			.subscribe(async ([paramMap, queryParamMap]) => {
				this.dateOptions.from = queryParamMap.has("from") ? moment(queryParamMap.get("from")) : undefined;
				this.dateOptions.to = queryParamMap.has("to") ? moment(queryParamMap.get("to")) : undefined;
				await this.getAvailableEvents();
				if (queryParamMap.has("eventTypes")) {
					this.readBinaryValuesFromQueryParams(this.eventTypes, queryParamMap.get("eventTypes").split("|"));
				}
				if (queryParamMap.has("costTypes")) {
					this.readBinaryValuesFromQueryParams(this.costTypes, queryParamMap.get("costTypes").split("|"));
				}
				//in case the route is something like /tours/:eventId/costs, extract the event id
				if (paramMap.has("eventId")) {
					this.events = this.availableEvents.findIndex(event => event.id === +paramMap.get("eventId")) !== -1
						? [this.availableEvents.find(event => event.id === +paramMap.get("eventId"))]
						: [];
				}
				if (queryParamMap.has("eventIds")) {
					this.events = queryParamMap.get("eventIds")
						.split(",")
						.filter(eventId => this.availableEvents.findIndex(event => event.id === +eventId) !== -1)
						.map(eventId => this.availableEvents.find(event => event.id === +eventId));
				}
				this.updateQueryParams();
			})
	}

	/**
	 *
	 * @param object
	 * @returns {string}
	 */
	getBinaryQueryParamValue(object: {
		[key: string]: boolean
	}): string {
		return Object.keys(object)
			.filter(key => object[key])
			.join("|");
	}

	/**
	 * Updates the query parameters based on the values chosen by the user
	 */
	updateQueryParams() {
		let params: Params = {};
		let assignType = (paramKey: string, object: {
			[key: string]: boolean
		}) => {
			params[paramKey] = "";
			if (!Object.keys(object).every(key => object[key])) {
				params[paramKey] = this.getBinaryQueryParamValue(object);
				if (params[paramKey] === "") {
					params[paramKey] = "none";
				}
			}
		};

		assignType("eventTypes", this.eventTypes);
		assignType("costTypes", this.costTypes);

		params["eventIds"] = this.events.map(event => "" + event.id).join(",");

		params["from"] = !this.dateOptions.from ? "" : this.dateOptions.from.toISOString();
		params["to"] = !this.dateOptions.to ? "" : this.dateOptions.to.toISOString();

		this.activatedRoute.queryParamMap.first()
			.map(queryParamMap =>
				this.queryParameterService.updateQueryParams(queryParamMap, params))
			.subscribe(newQueryParams =>
				this.router.navigate(["management", "costs"], {queryParams: newQueryParams, replaceUrl: true}));
	}
}
