import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {EntryCategory} from "../../../../shared/model/entry-category";
import {Location} from "@angular/common";
import {Observable} from "rxjs/Observable";
import {FormControl} from "@angular/forms";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {EventService} from "../../../../shared/services/event.service";
import {Event} from "../../../shared/model/event";
import {EventType} from "../../../shared/model/event-type";
import {ActivatedRoute} from "@angular/router";

@Component({
	selector: "memo-modify-entry",
	templateUrl: "./modify-entry.component.html",
	styleUrls: ["./modify-entry.component.scss"]
})
export class ModifyEntryComponent implements OnInit {
	@Input() model: any;
	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<any> = new EventEmitter();
	associatedEvent:Event;

	ModifyType = ModifyType;
	EntryCategory = EntryCategory;

	entryCategories = [EntryCategory.Food, EntryCategory.Fuel, EntryCategory.LeasingCar, EntryCategory.Tickets, EntryCategory.Tours];

	autocompleteFormControl: FormControl = new FormControl();
	filteredOptions: Observable<Event[]>;

	get entryModel() {
		return this.model;
	}

	set entryModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
	}

	constructor(private location: Location,
				private activatedRoute: ActivatedRoute,
				private eventService: EventService) {
	}

	ngOnInit() {
		this.activatedRoute.queryParamMap
			.first()
			.subscribe(queryParamMap => {
				if(queryParamMap.has("eventId")){
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
				if (EventUtilityService.isTour(value) || EventUtilityService.isParty(value)) {
					this.associatedEvent = value;
				}
			});

		this.filteredOptions = this.autocompleteFormControl.valueChanges
			.startWith("")
			.map(event => event && typeof event === "object" ? event.title : event)
			.flatMap(title => {
				return Observable.combineLatest(
					this.eventService.search("", EventType.tours),
					this.eventService.search("", EventType.partys)
				)
					.map(([tours, partys]) => {
						let availableEvents = [...tours, ...partys];
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
