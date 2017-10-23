import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {Observable} from "rxjs/Rx";
import {FormControl} from "@angular/forms";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {EventService} from "../../../../shared/services/api/event.service";
import {Event} from "../../../shared/model/event";
import {EventType} from "../../../shared/model/event-type";
import {ActivatedRoute} from "@angular/router";
import {EntryCategoryService} from "../../../../shared/services/api/entry-category.service";
import {ModifyItemEvent} from "app/shop/shop-item/modify-shop-item/modify-item-event";
import {EntryCategory} from "../../../../shared/model/entry-category";

@Component({
	selector: "memo-modify-entry",
	templateUrl: "./modify-entry.component.html",
	styleUrls: ["./modify-entry.component.scss"]
})
export class ModifyEntryComponent implements OnInit {
	@Input() model: any;
	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<ModifyItemEvent> = new EventEmitter();
	_associatedEvent: Event;

	get associatedEvent() {
		return this._associatedEvent;
	}

	set associatedEvent(event: Event) {
		this._associatedEvent = event;
		this.model["event"] = event;
	}

	ModifyType = ModifyType;

	entryCategories$ = this.entryCategoryService.getCategories();

	autocompleteFormControl: FormControl = new FormControl();
	filteredOptions: Observable<Event[]>;

	constructor(private location: Location,
				private activatedRoute: ActivatedRoute,
				private entryCategoryService: EntryCategoryService,
				private eventService: EventService) {
	}

	get entryModel() {
		return this.model;
	}

	set entryModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
	}

	ngOnInit() {
		if (this.model["event"] && this.model["event"] !== null &&
			(EventUtilityService.isMerchandise(this.model["event"]) ||
				EventUtilityService.isTour(this.model["event"]) ||
				EventUtilityService.isParty(this.model["event"]))) {
			this.associatedEvent = this.model["event"];
			this.autocompleteFormControl.setValue(this.associatedEvent);
		}
		this.activatedRoute.queryParamMap
			.first()
			.subscribe(queryParamMap => {
				if (queryParamMap.has("eventId")) {
					this.eventService.getById(+queryParamMap.get("eventId"))
						.first()
						.subscribe(event => {
							this.associatedEvent = event;
							this.autocompleteFormControl.setValue(event);
						});
				}
			});
		this.autocompleteFormControl.valueChanges
			.subscribe(value => {
				if (EventUtilityService.isTour(value) || EventUtilityService.isParty(value) || EventUtilityService.isMerchandise(value)) {
					this.associatedEvent = value;
				}
			});

		this.filteredOptions = this.autocompleteFormControl.valueChanges
			.startWith("")
			.map(event => event && typeof event === "object" ? event.title : event)
			.flatMap(title => {
				return Observable.combineLatest(
					this.eventService.search("", EventType.tours),
					this.eventService.search("", EventType.partys),
					this.eventService.search("", EventType.merch)
				)
					.map(([tours, partys, merch]) => {
						let availableEvents = [...tours, ...partys, ...merch];
						return title
							? this.filter(availableEvents, title)
							: availableEvents.slice()
					})
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

	compareCategories(value1:EntryCategory, value2:EntryCategory){
		return value1 && value2 && value1.id === value2.id;
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


	cancel() {
		this.location.back();
	}

	submitModifiedObject() {
		this.onSubmit.emit({
			model: this.model,
			eventId: this.associatedEvent.id
		});
	}
}
